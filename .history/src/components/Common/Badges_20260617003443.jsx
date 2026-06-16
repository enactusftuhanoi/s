import React from 'react';
import { Icon } from './Icons';
import { isExpired, daysUntil } from './Utils';

export const LinkStatusBadges = ({ link }) => {
  const badges = [];
  
  if (isExpired(link.expiry_date)) {
    badges.push(
      <span key="e" className="badge badge-red" style={{ fontSize: 11 }}>
        <Icon name="clock" size={10} /> Expired
      </span>
    );
  } else {
    const days = daysUntil(link.expiry_date);
    if (days !== null && days <= 7) {
      badges.push(
        <span key="w" className="badge badge-orange" style={{ fontSize: 11 }}>
          <Icon name="clock" size={10} /> {days} days
        </span>
      );
    } else {
      badges.push(
        <span key="a" className="badge badge-green" style={{ fontSize: 11 }}>Active</span>
      );
    }
  }
  
  if (link.has_password) {
    badges.push(
      <span key="p" className="badge badge-blue" style={{ fontSize: 11 }}>
        <Icon name="lock" size={10} /> Password
      </span>
    );
  }
  
  return <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{badges}</div>;
<<<<<<< HEAD
};
=======
};
>>>>>>> 66de892 (Fix CORS và cập nhật CSS styles)
