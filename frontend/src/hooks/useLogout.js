import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser, reset } from "store/slices/authSlice";
import Swal from "sweetalert2";

export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);

  const logout = async (options = {}) => {
    const {
      showConfirmation = true,
      confirmTitle = 'Konfirmasi Logout',
      confirmText = 'Apakah Anda yakin ingin keluar dari sistem?',
      successTitle = 'Logout Berhasil!',
      successText = 'Anda telah berhasil keluar dari sistem',
      redirectTo = '/auth/signin'
    } = options;

    let shouldProceed = true;

    // Show confirmation dialog if enabled
    if (showConfirmation) {
      const result = await Swal.fire({
        title: confirmTitle,
        text: confirmText,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, Keluar',
        cancelButtonText: 'Batal',
        reverseButtons: true,
        customClass: {
          popup: 'rounded-xl',
          confirmButton: 'rounded-lg',
          cancelButton: 'rounded-lg'
        }
      });
      
      shouldProceed = result.isConfirmed;
    }

    if (shouldProceed) {
      try {
        // Show loading state
        Swal.fire({
          title: 'Logging out...',
          text: 'Mohon tunggu sebentar',
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
          customClass: {
            popup: 'rounded-xl'
          }
        });

        // Dispatch logout action
        const logoutResult = await dispatch(logoutUser());
        
        if (logoutUser.fulfilled.match(logoutResult)) {
          // Reset auth state
          dispatch(reset());
          
          // Close loading
          Swal.close();
          
          // Show success message
          await Swal.fire({
            title: successTitle,
            text: successText,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: 'rounded-xl'
            }
          });

          // Navigate to specified page
          navigate(redirectTo);
          
          return { success: true };
        } else {
          // Handle logout error
          Swal.fire({
            title: 'Logout Gagal!',
            text: logoutResult.payload || 'Terjadi kesalahan saat logout',
            icon: 'error',
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'rounded-xl',
              confirmButton: 'rounded-lg'
            }
          });
          
          return { success: false, error: logoutResult.payload };
        }
      } catch (error) {
        console.error('Logout error:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Terjadi kesalahan yang tidak terduga',
          icon: 'error',
          confirmButtonColor: '#dc2626',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'rounded-xl',
            confirmButton: 'rounded-lg'
          }
        });
        
        return { success: false, error: error.message };
      }
    }
    
    return { success: false, cancelled: true };
  };

  return {
    logout,
    isLoading
  };
};
