import ConnectingServerPopup from '../../components/popups/ConnectingServerPopup';

window.GetServerConnectionPopup = () => {
    return <ConnectingServerPopup />;
};

declare global {
    interface Window {
        GetServerConnectionPopup: () => void;
    }
}
