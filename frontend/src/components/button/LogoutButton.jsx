import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { logoutUser, reset } from "store/slices/authSlice";
import Swal from "sweetalert2";

const LogoutButton = ({ 
  variant = "button", // "button" | "outline" | "link" | "icon"
  size = "md", // "sm" | "md" | "lg"
  className = "",
  children,
  ...props
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Konfirmasi Logout',
      text: 'Apakah Anda yakin ingin keluar dari sistem?',
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

    if (result.isConfirmed) {
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
          
          // Close loading and show success
          Swal.close();
          
          await Swal.fire({
            title: 'Logout Berhasil!',
            text: 'Anda telah berhasil keluar dari sistem',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: 'rounded-xl'
            }
          });

          // Navigate to login page
          navigate('/auth/signin');
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
      }
    }
  };

  // Base classes for different variants
  const getVariantClasses = () => {
    switch (variant) {
      case "outline":
        return "inline-flex items-center justify-center rounded-lg border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors";
      case "link":
        return "inline-flex items-center text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors";
      case "icon":
        return "flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-all";
      default: // button
        return "inline-flex items-center justify-center rounded-lg bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-colors";
    }
  };

  // Size classes
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return variant === "icon" ? "h-8 w-8" : "px-3 py-1.5 text-sm";
      case "lg":
        return variant === "icon" ? "h-12 w-12" : "px-6 py-3 text-lg";
      default: // md
        return variant === "icon" ? "h-10 w-10" : "px-4 py-2 text-base";
    }
  };

  const baseClasses = `${getVariantClasses()} ${getSizeClasses()} disabled:opacity-50 disabled:cursor-not-allowed ${className}`;

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={baseClasses}
      title="Logout"
      {...props}
    >
      <RiLogoutBoxRLine className={`${
        variant === "icon" ? "h-5 w-5" : 
        size === "sm" ? "h-4 w-4 mr-2" : 
        size === "lg" ? "h-6 w-6 mr-3" : 
        "h-5 w-5 mr-2"
      }`} />
      {variant !== "icon" && (
        <span>
          {children || (isLoading ? 'Logging out...' : 'Logout')}
        </span>
      )}
    </button>
  );
};

export default LogoutButton;
