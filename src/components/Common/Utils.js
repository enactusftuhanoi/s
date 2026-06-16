import Swal from 'sweetalert2';

export const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  }
};

export const toast = (title, icon = 'success', timer = 1800) => {
  Swal.fire({
    icon,
    title,
    timer,
    showConfirmButton: false,
    toast: true,
    position: 'top-end',
    timerProgressBar: true,
  });
};

export const confirmDialog = (title, text, confirmText = 'Xác nhận') => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#FFC107',
    cancelButtonText: 'Hủy',
    confirmButtonText: confirmText,
  });
};

export const formatDate = (d) => {
  return d
    ? new Date(d).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '-';
};

export const isExpired = (expiry) => {
  return expiry && new Date(expiry) < new Date();
};

export const daysUntil = (expiry) => {
  if (!expiry) return null;
  return Math.ceil((new Date(expiry) - new Date()) / 86400000);
};

export const getPasswordStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: 'var(--gray-200)', pct: 0 };
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { score: s, label: 'Rất yếu', color: '#EF4444', pct: 20 };
  if (s === 2) return { score: s, label: 'Yếu', color: '#F97316', pct: 40 };
  if (s === 3) return { score: s, label: 'Trung bình', color: '#FFC107', pct: 60 };
  if (s === 4) return { score: s, label: 'Mạnh', color: '#10B981', pct: 80 };
  return { score: s, label: 'Rất mạnh', color: '#059669', pct: 100 };
};

export const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.split(' ');
  const lastName = parts[parts.length - 1];
  return lastName.length >= 2 ? lastName.slice(-2).toUpperCase() : lastName.toUpperCase();
};
