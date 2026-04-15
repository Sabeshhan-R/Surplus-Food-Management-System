import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Bell } from 'lucide-react';

export const SkeletonBox = ({ height, width = '100%', radius = '4px', className = '' }) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ height, width, borderRadius: radius }}
    />
  );
};

export const MetricCardSkeleton = () => {
  return (
    <Card className="border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
      <div className="d-flex flex-column align-items-center mb-0">
        <SkeletonBox width="48px" height="48px" radius="8px" className="mb-3" />
        <SkeletonBox width="60%" height="32px" className="mb-2" />
        <SkeletonBox width="40%" height="16px" />
      </div>
    </Card>
  );
};

export const TableRowSkeleton = ({ cols = 4 }) => {
  return (
    <tr>
      <td>
        <SkeletonBox width="70%" height="16px" className="mb-1" />
        <SkeletonBox width="40%" height="12px" />
      </td>
      {Array.from({ length: cols - 2 }).map((_, i) => (
        <td key={i}>
          <SkeletonBox width="60%" height="16px" />
        </td>
      ))}
      <td>
        <div className="d-flex gap-2">
          <SkeletonBox width="30px" height="30px" radius="4px" />
          <SkeletonBox width="30px" height="30px" radius="4px" />
        </div>
      </td>
    </tr>
  );
};

export const TableSkeleton = ({ rows = 3, cols = 4 }) => {
  return (
    <div className="table-responsive">
      <table className="app-table">
        <thead className="bg-light">
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}>
                <SkeletonBox width="50%" height="16px" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const NotifSkeleton = () => {
  return (
    <div className="notif-card skeleton-card d-flex align-items-start gap-3">
      <SkeletonBox width="40px" height="40px" radius="8px" />
      <div className="flex-grow-1">
        <SkeletonBox width="80%" height="16px" className="mb-2" />
        <SkeletonBox width="40%" height="12px" />
      </div>
      <SkeletonBox width="20px" height="20px" radius="4px" />
    </div>
  );
};

export const DashboardOverviewSkeleton = () => {
  return (
    <div className="animate-in">
      <SkeletonBox width="30%" height="24px" className="mb-4" />
      <Row className="g-4 mb-4">
        {[1, 2, 3].map((i) => (
          <Col md={4} key={i}>
            <MetricCardSkeleton />
          </Col>
        ))}
      </Row>
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Header className="bg-white py-3 border-0">
          <SkeletonBox width="20%" height="20px" />
        </Card.Header>
        <Card.Body>
          <TableSkeleton rows={4} cols={4} />
        </Card.Body>
      </Card>
    </div>
  );
};
