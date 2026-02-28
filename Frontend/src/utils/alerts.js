import Swal from 'sweetalert2';

export const showAlert = (message, title = 'Notification', icon = 'info') => {
    return Swal.fire({
        title,
        text: message,
        icon,
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
    });
};

export const showError = (message, title = 'Erreur') => {
    return Swal.fire({
        title,
        text: message,
        icon: 'error',
        confirmButtonColor: '#006233',
        confirmButtonText: 'OK'
    });
};

export const showSuccess = (message, title = 'Succès') => {
    return Swal.fire({
        title,
        text: message,
        icon: 'success',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
    });
};

export const showConfirm = async (message, title = 'Êtes-vous sûr ?', confirmText = 'Oui', cancelText = 'Non') => {
    const result = await Swal.fire({
        title,
        text: message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#006233',
        cancelButtonColor: '#d33',
        confirmButtonText: confirmText,
        cancelButtonText: cancelText
    });
    return result.isConfirmed;
};
