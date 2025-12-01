/**
 * ErrorBoundary.jsx
 *
 * NHIỆM VỤ: Bắt lỗi khi load model hoặc render 3D scene
 * - Hiển thị thông báo lỗi thay vì crash toàn bộ app
 * - Cho phép người dùng thử lại
 */

import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('3D Scene Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          color: 'white',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '15px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#ff6b6b' }}>❌ Lỗi khi load model</h3>
          <p style={{ color: '#aaa', maxWidth: '400px' }}>
            Model có thể bị lỗi hoặc không tương thích.
          </p>
          <p style={{ fontSize: '12px', color: '#666' }}>
            {this.state.error?.message}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '10px 20px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Thử lại
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
