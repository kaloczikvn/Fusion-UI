import React, { useEffect, useRef, useState } from 'react';

export default function AnimatedBackground() {
    const canvasRef = useRef(null);
    const shouldRenderRef = useRef(false);
    const imgRef = useRef(null);
    const iterationRef = useRef(0);
    const totalIterations = 800;

    useEffect(() => {
        shouldRenderRef.current = true;

        imgRef.current = new Image();
        imgRef.current.onload = () => {
            window.requestAnimationFrame(() => onRender());
        };

        imgRef.current.src = '/assets/img/background.png';

        return () => {
            shouldRenderRef.current = false;
        };
    }, []);

    const easeInOutCubic = (time, duration, valueStart, valueEnd) => {
        return (-valueEnd / 2) * (Math.cos((Math.PI * time) / duration) - 1) + valueStart;
    };

    const onRender = () => {
        if (!shouldRenderRef.current) return;

        let width = document.body.offsetWidth;
        let height = document.body.offsetHeight;

        // Paint the blur regions in our final canvas.
        let finalCanvas = canvasRef.current;
        let finalContext = finalCanvas.getContext('2d');

        if (finalCanvas.width != width) finalCanvas.width = width;

        if (finalCanvas.height != height) finalCanvas.height = height;

        let imgRatio = imgRef.current.width / imgRef.current.height;
        let viewportRatio = width / height;

        let finalWidth = imgRef.current.width;
        let finalHeight = imgRef.current.height;
        let imgTop = 0;
        let imgLeft = 0;

        if (viewportRatio > imgRatio) {
            // Scale based on width.
            let scaleRatio = (width * 1.3) / imgRef.current.width;
            finalWidth *= scaleRatio;
            finalHeight *= scaleRatio;

            imgTop = -(finalHeight - height) / 2.0;
        } else {
            // Scale based on height.
            let scaleRatio = (height * 1.3) / imgRef.current.height;
            finalWidth *= scaleRatio;
            finalHeight *= scaleRatio;

            imgLeft = -(finalWidth - width) / 2.0;
        }

        var xOffset = 0;
        var yOffset = 0;

        var xStep = -0.1157407407407407 * height; // -125px
        var xStart = -0.0925925925925926 * height; // -100px
        var xEnd = xStart + xStep;

        var yStep = -0.0462962962962963 * height; // -50px
        var yStart = -0.0925925925925926 * height; // -100px
        var yEnd = yStart + yStep;

        if (iterationRef.current >= totalIterations) {
            xOffset = easeInOutCubic(iterationRef.current - totalIterations, totalIterations, xEnd, -xStep);
            yOffset = easeInOutCubic(iterationRef.current - totalIterations, totalIterations, yEnd, -yStep);
        } else {
            xOffset = easeInOutCubic(iterationRef.current, totalIterations, xStart, xStep);
            yOffset = easeInOutCubic(iterationRef.current, totalIterations, yStart, yStep);
        }

        finalContext.drawImage(imgRef.current, imgLeft + xOffset, imgTop + yOffset, finalWidth, finalHeight);

        if (iterationRef.current > totalIterations * 2) iterationRef.current = 0;
        else iterationRef.current += 0.5;

        window.requestAnimationFrame(() => onRender());
    };

    return <canvas ref={canvasRef} id="animated-background"></canvas>;
}
