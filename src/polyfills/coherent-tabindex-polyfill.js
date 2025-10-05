/**
 * @file coherent-tabindex-polyfill.js
 * Coherent polyfill for the tabindex functionality.
 * Supports the tab and shift + tab functionality that moves the focus of elements.
 * The supported elements are <input>, <a>, <button> and <textarea> tags and all elements that have a tabindex.
 */
((factory) => {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(global, 'node');
    } else {
        return factory(window, 'browser');
    }
})((global, env) => {
    if (navigator.userAgent.indexOf('Cohtml') !== -1) {
        // Used to control the behavior of mouseEventFocus().
        let isMouseDown = false;
        /**
         * A sorted collection of numbers that holds all tab indices that are present in the page.
         * The order is ascending with 0 always being at the end e.g. [1, 2, 3, 5, 0]
         * @var {Array<Number>} tabIndices
         */
        const tabIndices = [];

        function swap(arr, i, j) {
            const tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }

        /**
         * Adds the tab index to the collection of indices. Keeps the collection sorted.
         * @param {Number} tabIndex
         */
        function tabIndexAddedToPage(tabIndex) {
            if (isNaN(tabIndex)) return;

            // Negative indices and already present indices are ignored.
            if (tabIndices.indexOf(tabIndex) !== -1 || tabIndex < 0) return;

            // There is nothing to sort if we are adding 0 at the end or if
            // there is only 1 element in the collection.
            // if (tabIndices.length === 1 || tabIndex === 0) return;

            // Just add a new element to the tab indices collection if the
            // tabIndex value is bigger than the last element value in the collection.
            if (tabIndices[tabIndices.length - 1] < tabIndex) {
                tabIndices.push(tabIndex);
                return;
            }

            // Loop the tab indices collection and add a new element to it with
            // the unique tabIndex value. Place the element on the position of
            // the element which value is larger than the current tabIndex value.
            for (let i = 0; i < tabIndices.length; i++) {
                if (tabIndices[i] > tabIndex) {
                    tabIndices.splice(i, 0, tabIndex);
                    return;
                }
            }
        }

        /**
         * Removes the tab index from the collection of indices if no more elements in the page have that index. Keeps the collection sorted.
         * @param {Number} tabIndex The index removed from the page.
         */
        function tabIndexRemovedFromPage(tabIndex) {
            if (isNaN(tabIndex)) return;

            // If there are no more elements with that index in the page remove it from the collection.
            if (null === document.querySelector(`[tabindex="${tabIndex}"]`)) {
                // Removing all elements with a tabindex at once enters this condition for each removed element.
                // Checking whether the index is present in the collection handles that.
                let idx = tabIndices.indexOf(tabIndex);
                if (idx !== -1) {
                    tabIndices.splice(tabIndices.indexOf(tabIndex), 1);
                }
            }
        }

        /**
         * Removes the old tab index from the collection and adds the one to it.
         * @param {Element} element The element that has its tabindex changed.
         * @param {String} oldValue The old tab index value.
         */
        function elementTabIndexChanged(element, oldValue) {
            if (element.hasAttribute('tabindex')) {
                const newTabIndex = parseInt(element.getAttribute('tabindex'));
                tabIndexAddedToPage(newTabIndex);
            }

            if (oldValue) {
                tabIndexRemovedFromPage(parseInt(oldValue));
            }
        }

        /**
         * Focuses the currentTarget in the next frame and stops the event propagation.
         * The next frame is important as cohtml will not focus the element otherwise.
         * @param {MouseEvent} event The mouse event.
         */
        function mouseEventFocus(event) {
            const currentTarget = event.currentTarget;

            /*
             * The very first element to call this function gets focused. The other
             * calls from the bubbling phase will not cause that elements to be
             * focused as isMouseDown is already true.
             */
            if (!isMouseDown && event.type === 'mousedown') {
                window.requestAnimationFrame(() => focusElement(currentTarget));
            }

            isMouseDown = event.type === 'mousedown';
        }

        /**
         * Adds new tab indices to the collection.
         * Sets the tabindex of focusable elements by default that don't have tabindex to 0.
         * @param {NodeList} addedNodes The new nodes.
         */
        function nodesAddedToThePageMutationHandler(addedNodes) {
            const addedLength = addedNodes.length;
            for (let i = 0; i < addedLength; ++i) {
                const element = addedNodes[i];

                const childElements = element.querySelectorAll('[tabindex]');
                const elementsLength = childElements.length;
                for (let i = 0; i < elementsLength; ++i) {
                    const element = childElements[i];
                    const tabIndex = parseInt(element.getAttribute('tabindex'));
                    tabIndexAddedToPage(tabIndex);
                }

                // <unknown> nodes generated through data binding don't have a hasAttribute method
                // and have to be ignored
                if (element.nodeType === 1 && element.hasAttribute && element.hasAttribute('tabindex')) {
                    const tabIndex = parseInt(element.getAttribute('tabindex'));
                    tabIndexAddedToPage(tabIndex);
                }
            }
        }

        /**
         * Removes the tab indices, of all elements that are removed from the page, from the collection.
         * @param {NodeList} removedNodes The removed nodes.
         */
        function nodesRemovedFromThePageMutationHandler(removedNodes) {
            const removedLength = removedNodes.length;
            for (let i = 0; i < removedLength; ++i) {
                const element = removedNodes[i];

                // <unknown> nodes generated through data binding don't have a hasAttribute method
                // and have to be ignored
                if (element.nodeType === 1 && element.hasAttribute && element.hasAttribute('tabindex')) {
                    const tabIndex = parseInt(element.getAttribute('tabindex'));
                    tabIndexRemovedFromPage(tabIndex);
                }
            }
        }

        /**
         * Callback called when a DOM mutation happens.
         * @param {Array<MutationRecord>} mutationList
         */
        function mutationCallback(mutationList) {
            const mutationListLength = mutationList.length;
            for (let i = 0; i < mutationListLength; ++i) {
                const mutation = mutationList[i];

                if (mutation.type === 'childList') {
                    if (mutation.addedNodes) {
                        nodesAddedToThePageMutationHandler(mutation.addedNodes);
                    }

                    if (mutation.removedNodes) {
                        nodesRemovedFromThePageMutationHandler(mutation.removedNodes);
                    }
                } else if (mutation.type === 'attributes' && mutation.attributeName === 'tabindex') {
                    elementTabIndexChanged(mutation.target, mutation.oldValue);
                }
            }
        }

        /**
         * An observer that fires a callback on DOM changes.
         * @var {MutationObserver} observer
         */
        const observer = new MutationObserver(mutationCallback);

        /**
         * @function initializePolyfill
         * Initializes the polyfill by filling the tab indices collection.
         */
        function initializePolyfill() {
            // Adds the unique tab indices of all elements that have one to the collection of indices.
            // Negative values for tabindex are excluded as these elements should not be sequentially focusable.
            const elements = document.querySelectorAll('[tabindex]');
            const elementsLength = elements.length;
            for (let i = 0; i < elementsLength; ++i) {
                const element = elements[i];
                const tabIndex = parseInt(element.getAttribute('tabindex'));

                if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndices.indexOf(tabIndex) === -1) {
                    tabIndices.push(tabIndex);
                }

                // FIXME: This is commented out as it causes issues with some elements.
                // element.addEventListener('mousedown', (event) => mouseEventFocus(event));
                // element.addEventListener('mouseup', (event) => mouseEventFocus(event));
            }

            // Sort the collection in ascending order.
            tabIndices.sort((a, b) => {
                if (a === 0) return 1;
                if (a > b) return 1;
                if (a < b) return -1;
            });
        }

        /**
         * Blurs the currently focused element and focuses the new one.
         * @param {Element} element The element to be focused.
         */
        function focusElement(element) {
            document.activeElement.blur();
            element.focus();
        }

        /**
         * @function focusNextElements
         * Focuses the next element with the same tabindex or the first element
         * with the next tabindex.
         * The order of elements is the one provided by querySelectorAll.
         */
        function focusNextElement() {
            let tabIndex = parseInt(document.activeElement.getAttribute('tabindex'));
            let elements = document.querySelectorAll(`[tabindex="${tabIndex}"]`);
            const elementsLength = elements.length;

            // If the current active element is the last with the
            // current tabindex, focus the first element with the next tabindex.
            if (document.activeElement === elements[elements.length - 1]) {
                // Divide the next element index from the tabIndices with the
                // length of the collection and return the remainder.
                // Set tabIndex value through accessing the element with the
                // returned remainder from the tabIndices collection.
                // If the next element index divided by the length of the
                // tabIndices is 0 then set the tabIndex of the zeroth element.
                tabIndex = tabIndices[(tabIndices.indexOf(tabIndex) + 1) % tabIndices.length];
                elements = document.querySelectorAll(`[tabindex="${tabIndex}"]`);
                focusElement(elements[0]);
                return;
            }

            // Focus the element after the currently active element.
            for (let i = 0; i < elementsLength - 1; ++i) {
                if (elements[i] === document.activeElement) {
                    focusElement(elements[i + 1]);
                    return;
                }
            }
        }

        /**
         * @function focusPreviousElement
         * Focuses the previous element with the same tabindex or the last element with the previous tabindex.
         * The order of elements is the one provided by querySelectorAll.
         */
        function focusPreviousElement() {
            let tabIndex = parseInt(document.activeElement.getAttribute('tabindex'));
            let elements = document.querySelectorAll(`[tabindex="${tabIndex}"]`);

            // If the current active element is the first with the
            // current tabindex, focus the last element with the previous tabindex.
            if (document.activeElement === elements[0]) {
                // Divide the length of tabIndices + the previous element index
                // with the length of the collection and return the remainder.
                // Set tabIndex value through accessing the element with the
                // returned remainder from the tabIndices collection.
                // The length of tabIndices + the previous element index
                // calculation is needed to get back to the last element from
                // the collection.
                tabIndex = tabIndices[(tabIndices.length + tabIndices.indexOf(tabIndex) - 1) % tabIndices.length];
                elements = document.querySelectorAll(`[tabindex="${tabIndex}"]`);
                focusElement(elements[elements.length - 1]);
                return;
            }

            // If the active element is not the first in the collection focus the element before the currently active one.
            const elementsLength = elements.length;
            for (let i = 1; i < elementsLength; ++i) {
                if (elements[i] === document.activeElement) {
                    focusElement(elements[i - 1]);
                    return;
                }
            }
        }

        /**
         * Returns true if element is not visible.
         * @param {Object} elementComputedStyles
         */
        function checkElementVisibility(elementComputedStyles) {
            return (
                parseFloat(elementComputedStyles.getPropertyValue('opacity')) < 0.001 ||
                elementComputedStyles.getPropertyValue('visibility') === 'hidden' ||
                elementComputedStyles.getPropertyValue('display') === 'none'
            );
        }

        /**
         * Checks whether the active element is invisible.
         * @function isActiveElementInvisible
         * @returns {boolean}
         */
        function isActiveElementInvisible() {
            const activeElement = document.activeElement;

            let parentElement = activeElement.parentNode;
            // Check parents visibility and return true if any of them are hidden.
            for (; parentElement && parentElement !== document; parentElement = parentElement.parentNode) {
                if (checkElementVisibility(window.getComputedStyle(parentElement))) {
                    return true;
                }
            }

            return checkElementVisibility(window.getComputedStyle(activeElement));
        }

        observer.observe(document.body, {
            childList: true,
            attributeFilter: ['tabindex'],
            attributeOldValue: true,
            subtree: true,
        });

        window.addEventListener('load', function () {
            initializePolyfill();

            // Start listening for tab keydowns on document load.
            document.addEventListener('keydown', function (event) {
                if (event.keyCode === 9) {
                    if (event.shiftKey) {
                        do {
                            focusPreviousElement();
                        } while (isActiveElementInvisible());
                    } else {
                        do {
                            focusNextElement();
                        } while (isActiveElementInvisible());
                    }
                }
            });

            // Start observing for changes on document load.
        });
    }
});
