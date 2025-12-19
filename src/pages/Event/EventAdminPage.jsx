/**
 * EventAdminPage - Admin control panel for event management
 */
import React, { useEffect, useState } from 'react';
import {
  fetchStats,
  getRecentNotes,
  importTickets,
  pickLuckyWinner,
} from '../../services/event/eventApi';
import {
  broadcastLuckyDrawStart,
  broadcastWinner,
  broadcastStatsUpdate,
} from '../../services/event/ably';
import { ADMIN_PASSWORD, getDiamondConfig } from '../../constants/eventConstants';
import Logo from '../../components/event/ui/Logo';
import Diamond from '../../components/event/ui/Diamond';

import '../../styles/event.css';

const EventAdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState(null);
  const [recentNotes, setRecentNotes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastWinner, setLastWinner] = useState(null);
  const [csvInput, setCsvInput] = useState('');
  const [importResult, setImportResult] = useState(null);

  // Load data on auth
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      // Refresh every 30 seconds
      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    const [statsData, notesData] = await Promise.all([fetchStats(), getRecentNotes(50)]);
    setStats(statsData);
    setRecentNotes(notesData);

    // Broadcast stats update
    if (statsData) {
      broadcastStatsUpdate({
        totalParticipants: statsData.totalParticipants,
        totalNotes: statsData.totalNotes,
      });
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Mật khẩu không đúng');
    }
  };

  const handleImportTickets = async () => {
    if (!csvInput.trim()) return;

    const codes = csvInput
      .split(/[\n,]/)
      .map((code) => code.trim())
      .filter((code) => code.length > 0);

    if (codes.length === 0) {
      alert('Không có mã vé hợp lệ');
      return;
    }

    const result = await importTickets(codes);
    setImportResult(result);
    setCsvInput('');

    if (result.success) {
      loadData();
    }
  };

  const handleLuckyDraw = async () => {
    setIsDrawing(true);
    setLastWinner(null);

    // Broadcast draw start
    broadcastLuckyDrawStart();

    // Simulate animation delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Pick winner
    const result = await pickLuckyWinner();

    setIsDrawing(false);

    if (result.success) {
      setLastWinner(result.winner);
      broadcastWinner(result.winner);
    } else {
      alert(result.error || 'Không thể chọn người thắng');
    }
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="event-admin event-admin--login">
        <Logo size="md" />
        <form onSubmit={handleLogin} className="admin-login-form">
          <h2>Admin Login</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
            className="event-input"
            autoFocus
          />
          <button type="submit" className="event-btn event-btn--primary">
            Đăng nhập
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="event-admin">
      <div className="admin-header">
        <Logo size="sm" />
        <h1>Event Admin</h1>
        <button
          className="event-btn event-btn--text"
          onClick={() => setIsAuthenticated(false)}
        >
          Đăng xuất
        </button>
      </div>

      <div className="admin-content">
        {/* Stats Section */}
        <section className="admin-section">
          <h2>Thống kê</h2>
          {stats ? (
            <div className="admin-stats">
              <div className="event-stat-card">
                <span className="event-stat-value">{stats.totalTickets}</span>
                <span className="event-stat-label">Tổng vé</span>
              </div>
              <div className="event-stat-card">
                <span className="event-stat-value">{stats.usedTickets}</span>
                <span className="event-stat-label">Đã sử dụng</span>
              </div>
              <div className="event-stat-card">
                <span className="event-stat-value">{stats.totalParticipants}</span>
                <span className="event-stat-label">Người tham gia</span>
              </div>
              <div className="event-stat-card">
                <span className="event-stat-value">{stats.totalNotes}</span>
                <span className="event-stat-label">Nốt nhạc</span>
              </div>
              <div className="event-stat-card">
                <span className="event-stat-value">
                  {stats.totalTickets > 0
                    ? Math.round((stats.usedTickets / stats.totalTickets) * 100)
                    : 0}
                  %
                </span>
                <span className="event-stat-label">Tỷ lệ tham gia</span>
              </div>
            </div>
          ) : (
            <p>Đang tải...</p>
          )}
          <button className="event-btn event-btn--secondary" onClick={loadData}>
            Làm mới
          </button>
        </section>

        {/* Import Tickets Section */}
        <section className="admin-section">
          <h2>Import Vé</h2>
          <textarea
            value={csvInput}
            onChange={(e) => setCsvInput(e.target.value)}
            placeholder="Nhập mã vé (mỗi dòng một mã hoặc phân cách bằng dấu phẩy)"
            className="admin-textarea"
            rows={5}
          />
          <button className="event-btn event-btn--primary" onClick={handleImportTickets}>
            Import
          </button>
          {importResult && (
            <div
              className={`import-result ${importResult.success ? 'success' : 'error'}`}
            >
              {importResult.success
                ? `Đã import ${importResult.imported} vé (${importResult.duplicates} trùng)`
                : importResult.error}
            </div>
          )}
        </section>

        {/* Lucky Draw Section */}
        <section className="admin-section">
          <h2>Quay Số May Mắn</h2>
          <button
            className="event-btn event-btn--primary lucky-draw-btn"
            onClick={handleLuckyDraw}
            disabled={isDrawing}
          >
            {isDrawing ? 'Đang quay...' : 'Bắt đầu quay số'}
          </button>
          {lastWinner && (
            <div className="last-winner">
              <h3>Người thắng cuộc:</h3>
              <div className="winner-display">
                <Diamond
                  shape={lastWinner.diamondShape || 'heart'}
                  size={60}
                  showGlow
                />
                <div className="winner-details">
                  <p className="winner-light">Ánh sáng #{lastWinner.lightNumber}</p>
                  <p className="winner-name">{lastWinner.displayName}</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Recent Notes Section */}
        <section className="admin-section">
          <h2>Nốt nhạc gần đây</h2>
          <div className="notes-table-container">
            <table className="notes-table">
              <thead>
                <tr>
                  <th>Light #</th>
                  <th>Tên</th>
                  <th>Kim cương</th>
                  <th>Nốt</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {recentNotes.map((note) => (
                  <tr key={note.id}>
                    <td>#{note.lightNumber || '-'}</td>
                    <td>{note.userDisplayName}</td>
                    <td>
                      <Diamond shape={note.diamondShape} size={24} />
                      <span>{getDiamondConfig(note.diamondShape)?.displayNameVi}</span>
                    </td>
                    <td>{note.pitch}</td>
                    <td>{new Date(note.createdAt).toLocaleTimeString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Display Screen Link */}
        <div className="admin-display-link">
          <a
            href="/event/display"
            target="_blank"
            rel="noopener noreferrer"
            className="event-btn event-btn--outline"
          >
            Mở màn hình lớn →
          </a>
        </div>
      </div>
    </div>
  );
};

export default EventAdminPage;
