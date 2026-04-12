import React from 'react';
import './Skeleton.css';

const Skeleton = ({ width, height, borderRadius, className = "" }) => {
  return (
    <div 
      className={`skeleton-base ${className}`}
      style={{ 
        width: width || '100%', 
        height: height || '20px', 
        borderRadius: borderRadius || '8px' 
      }}
    />
  );
};

export const CardSkeleton = () => (
  <div className="card-skeleton p-3 mb-3 bg-white rounded-4 border shadow-sm">
    <div className="d-flex align-items-center mb-3">
      <Skeleton width="40px" height="40px" borderRadius="50%" className="me-3" />
      <div className="flex-grow-1">
        <Skeleton width="60%" height="15px" className="mb-2" />
        <Skeleton width="40%" height="10px" />
      </div>
    </div>
    <Skeleton width="100%" height="100px" borderRadius="12px" className="mb-3" />
    <div className="d-flex gap-2">
      <Skeleton width="80px" height="30px" />
      <Skeleton width="80px" height="30px" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="table-skeleton bg-white rounded-4 border overflow-hidden">
    <div className="p-3 bg-light border-bottom">
      <Skeleton width="30%" height="20px" />
    </div>
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="p-3 border-bottom d-flex align-items-center gap-3">
        <Skeleton width="20%" height="15px" />
        <Skeleton width="30%" height="15px" />
        <Skeleton width="15%" height="15px" />
        <Skeleton width="25%" height="30px" borderRadius="20px" className="ms-auto" />
      </div>
    ))}
  </div>
);

export default Skeleton;
