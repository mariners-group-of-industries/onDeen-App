import Toast from 'react-native-toast-message';

export const showResponce = (message, type) => {
    

    let toastType = '';
    let text1 = 'API Responce';
    let text2 = message || 'API Responce';

    switch (type) {
        case 1:
            toastType = 'success';
            text1 = 'Success';
            text2 = message;
            break;
        case 2:
            toastType = 'info';
            text1 = 'Info';
            text2 = message;
            break;
        case 3:
            toastType = 'error';
            text1 = 'API Responce Error';
            text2 = message;
            break;
        default:
            toastType = 'info';
            text1 = 'Info';
            text2 = message;
            break;
    }

    
    
    

    Toast.show({
        type: toastType,
        position: 'top',
        text1: text1,
        text2: text2,
        visibilityTime: 5000,
        topOffset: 50,
        bottomOffset: 50,
        style: {
            zIndex: 9999999999,
        },
    });
};
