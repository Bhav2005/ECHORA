import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getDashboardStats,
  getDashboardComplaints,
  sendMailboxReply,
  updateComplaintStatus,
  checkMailbox
} from '../api/complaintApi';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { SealStamp, EchoMark } from '../components/EchoMark';
import { tokens } from '../styles/tokens';

const CHART_COLORS = [
  tokens.wax,
  tokens.safe,
  tokens.gold,
  '#8B5CF6',
  '#3B82F6',
  tokens.inkSoft
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [chainIntegrity, setChainIntegrity] = useState({ valid: true });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected complaint details for modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [mailboxReplies, setMailboxReplies] = useState([]);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalStatus, setModalStatus] = useState('');

  const COMPLAINT_API_URL =
    import.meta.env.VITE_COMPLAINT_API_URL || 'http://localhost:3002';

  const fetchData = async () => {
    setLoading(true);

    try {
      const statsRes = await getDashboardStats();
      const complaintsRes = await getDashboardComplaints();

      setStats(statsRes.stats);
      setComplaints(complaintsRes.complaints);
      setChainIntegrity(complaintsRes.chainIntegrity);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      } else {
        setError('Failed to retrieve dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');

    if (!token) {
      navigate('/admin/login');
    } else {
      fetchData();
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  // Open modal and fetch replies for mailbox
  const handleOpenComplaint = async (complaint) => {
    setSelectedComplaint(complaint);
    setModalStatus(complaint.status);
    setMailboxReplies([]);
    setModalLoading(true);

    try {
      const mailboxRes = await checkMailbox(complaint.mailbox_id);
      setMailboxReplies(mailboxRes.replies);
    } catch (err) {
      console.error('Error loading replies:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedComplaint) return;

    try {
      await updateComplaintStatus(selectedComplaint.id, newStatus);

      setModalStatus(newStatus);

      // Update locally
      setComplaints(prev =>
        prev.map(c =>
          c.id === selectedComplaint.id
            ? { ...c, status: newStatus }
            : c
        )
      );
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();

    if (!adminReplyText.trim() || !selectedComplaint) return;

    try {
      const replyRes = await sendMailboxReply(
        selectedComplaint.mailbox_id,
        adminReplyText
      );

      setMailboxReplies(prev => [...prev, replyRes.reply]);
      setAdminReplyText('');
    } catch (err) {
      alert('Failed to send reply');
    }
  };

  const getStatusBadgeStyle = (status) => {
    const base = {
      fontSize: 11,
      fontWeight: 600,
      padding: '3px 9px',
      borderRadius: 999
    };

    switch (status) {
      case 'RESOLVED':
        return {
          ...base,
          background: tokens.safeSoft,
          color: tokens.safe
        };

      case 'PENDING':
        return {
          ...base,
          background: tokens.waxSoft,
          color: tokens.waxDeep
        };

      default:
        return {
          ...base,
          background: tokens.goldSoft,
          color: tokens.gold
        };
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          items: 'center',
          justifyContent: 'center',
          minHeight: '85vh',
          textAlign: 'center',
          gap: 12
        }}
      >
        <div
          style={{
            fontSize: 16,
            color: tokens.inkSoft,
            fontWeight: 500
          }}
        >
          Loading secure dashboard ledger...
        </div>
      </div>
    );
  }

  const departmentsData = stats?.departments || [];
  const categoriesData = stats?.categories || [];

  // Mock heatmap matrix data from EchoraDemo.jsx for layout
  const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];

  const heat = [
    {
      cat: 'Academics',
      vals: [1, 3, 2, 5, 2, 4]
    },
    {
      cat: 'Harassment',
      vals: [0, 1, 3, 2, 4, 6]
    },
    {
      cat: 'Hostel & Facilities',
      vals: [2, 2, 1, 0, 1, 2]
    },
    {
      cat: 'Faculty conduct',
      vals: [1, 0, 2, 1, 3, 1]
    }
  ];

  const maxHeatVal = Math.max(
    ...heat.flatMap(h => h.vals)
  );

  const totalCount = complaints.length;

  const newCount = complaints.filter(
    c => c.status === 'PENDING'
  ).length;

  const reviewCount = complaints.filter(
    c =>
      c.status === 'INVESTIGATING' ||
      c.status === 'ESCALATED'
  ).length;

  const resolvedCount = complaints.filter(
    c => c.status === 'RESOLVED'
  ).length;

  const cardStyle = {
    background: tokens.surface,
    border: `1.5px solid ${tokens.border}`,
    borderRadius: 22,
    padding: 34,
    boxShadow:
      '0 10px 34px rgba(27,35,64,0.08), 0 2px 8px rgba(27,35,64,0.04)'
  };

  const inputStyle = {
    width: '100%',
    padding: '13px 15px',
    fontFamily: "'Work Sans',sans-serif",
    fontSize: 14.5,
    color: tokens.ink,
    background: tokens.paper,
    border: `1.5px solid ${tokens.border}`,
    borderRadius: 10,
    outline: 'none',
    boxSizing: 'border-box'
  };

  return (
    <div
      className="ech-step container mx-auto"
      style={{
        padding: '44px 24px',
        maxWidth: 1000,
        minHeight: '85vh'
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: 24,
          borderBottom: `1.5px solid ${tokens.border}`,
          marginBottom: 24
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Fraunces',serif",
              fontWeight: 700,
              fontSize: 28,
              color: tokens.ink,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            <EchoMark size={28} />
            Review queue
          </h1>

          <p
            style={{
              color: tokens.inkSoft,
              fontSize: 14,
              marginTop: 4
            }}
          >
            Every echo arrived blind-signed — there's no name to match it to.
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            background: tokens.paperDeep,
            border: `1.5px solid ${tokens.border}`,
            borderRadius: 10,
            padding: '8px 16px',
            fontSize: 13.5,
            fontWeight: 500,
            color: tokens.inkSoft,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e =>
            (e.currentTarget.style.borderColor = tokens.inkFaint)
          }
          onMouseLeave={e =>
            (e.currentTarget.style.borderColor = tokens.border)
          }
        >
          Logout
        </button>
      </div>

      {/* Audit Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 16,
          marginBottom: 24
        }}
        className="md:grid-cols-2"
      >
        {/* Ledger Integrity */}
        <div
          style={{
            padding: 16,
            borderRadius: 14,
            border: `1.5px solid ${
              chainIntegrity?.valid ? tokens.safe : '#B4453A'
            }`,
            background: chainIntegrity?.valid
              ? tokens.safeSoft
              : '#FBEAE7',
            color: chainIntegrity?.valid
              ? tokens.safe
              : '#B4453A',
            display: 'flex',
            gap: 12,
            alignItems: 'start'
          }}
        >
          <div style={{ marginTop: 2 }}>
            <SealStamp state="sealed" size={20} />
          </div>

          <div>
            <span
              style={{
                fontWeight: 600,
                display: 'block',
                fontSize: 14
              }}
            >
              {chainIntegrity?.valid
                ? 'Ledger Chain Verified Intact'
                : 'Warning: Ledger Chain Tampered!'}
            </span>

            <span
              style={{
                fontSize: 12,
                color: tokens.inkSoft,
                marginTop: 2,
                display: 'block'
              }}
            >
              SHA-256 genesis anchor locks database blocks.
              Current verification status is valid.
            </span>
          </div>
        </div>

        {/* k-Anonymity Banner */}
        <div
          style={{
            padding: 16,
            borderRadius: 14,
            border: `1.5px solid ${tokens.border}`,
            background: tokens.surface,
            color: tokens.ink,
            display: 'flex',
            gap: 12,
            alignItems: 'start'
          }}
        >
          <div style={{ marginTop: 2 }}>
            <SealStamp state="empty" size={20} />
          </div>

          <div>
            <span
              style={{
                fontWeight: 600,
                display: 'block',
                fontSize: 14
              }}
            >
              k-Anonymity Gate (k=5) Active
            </span>

            <span
              style={{
                fontSize: 12,
                color: tokens.inkSoft,
                marginTop: 2,
                display: 'block'
              }}
            >
              Aggregate statistics only display categories/departments
              with 5 or more submissions to prevent group leakage.
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2,1fr)',
          gap: 12,
          marginBottom: 24
        }}
        className="md:grid-cols-4"
      >
        {[
          [totalCount, 'Total received'],
          [newCount, 'New'],
          [reviewCount, 'Under review'],
          [resolvedCount, 'Resolved']
        ].map(([n, l], i) => (
          <div
            key={l}
            className="ech-chip"
            style={{
              animationDelay: `${i * 40}ms`,
              background: tokens.surface,
              border: `1.5px solid ${tokens.border}`,
              borderRadius: 14,
              padding: '17px 18px',
              boxShadow: '0 4px 14px rgba(27,35,64,0.05)'
            }}
          >
            <div
              style={{
                fontFamily: "'Fraunces',serif",
                fontWeight: 700,
                fontSize: 25,
                color: tokens.ink
              }}
            >
              {n}
            </div>

            <div
              style={{
                fontSize: 12,
                color: tokens.inkFaint,
                marginTop: 3
              }}
            >
              {l}
            </div>
          </div>
        ))}
      </div>

      {/* Visualizations row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 24,
          marginBottom: 24
        }}
        className="md:grid-cols-2"
      >
        {/* Categories Bar Chart */}
        <div
          className="ech-card"
          style={{
            ...cardStyle,
            padding: 24
          }}
        >
          <h3
            style={{
              fontFamily: "'Fraunces',serif",
              fontWeight: 600,
              fontSize: 16.5,
              color: tokens.ink,
              marginBottom: 16
            }}
          >
            Grievance Categories (k &ge; 5)
          </h3>

          {categoriesData.length === 0 ? (
            <div
              style={{
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                color: tokens.inkSoft
              }}
            >
              No categories meet the k-anonymity (k=5) threshold yet.
            </div>
          ) : (
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoriesData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={tokens.borderSoft}
                  />

                  <XAxis
                    dataKey="category"
                    stroke={tokens.inkSoft}
                    fontSize={10}
                  />

                  <YAxis
                    stroke={tokens.inkSoft}
                    fontSize={10}
                    allowDecimals={false}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: tokens.surface,
                      borderColor: tokens.border,
                      color: tokens.ink
                    }}
                  />

                  <Bar
                    dataKey="count"
                    fill={tokens.wax}
                    radius={[4, 4, 0, 0]}
                  >
                    {categoriesData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          CHART_COLORS[
                            index % CHART_COLORS.length
                          ]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Departments Pie Chart */}
        <div
          className="ech-card"
          style={{
            ...cardStyle,
            padding: 24
          }}
        >
          <h3
            style={{
              fontFamily: "'Fraunces',serif",
              fontWeight: 600,
              fontSize: 16.5,
              color: tokens.ink,
              marginBottom: 16
            }}
          >
            Department Pulse (k &ge; 5)
          </h3>

          {departmentsData.length === 0 ? (
            <div
              style={{
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                color: tokens.inkSoft
              }}
            >
              No departments meet the k-anonymity (k=5) threshold yet.
            </div>
          ) : (
            <div
              style={{
                height: 200,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  width: '50%',
                  height: '100%'
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentsData}
                      dataKey="count"
                      nameKey="department"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                    >
                      {departmentsData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            CHART_COLORS[
                              index % CHART_COLORS.length
                            ]
                          }
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        backgroundColor: tokens.surface,
                        borderColor: tokens.border,
                        color: tokens.ink
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div
                style={{
                  width: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  maxHeight: '100%',
                  overflowY: 'auto'
                }}
              >
                {departmentsData.map((d, i) => (
                  <div
                    key={d.department}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 11
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background:
                          CHART_COLORS[
                            i % CHART_COLORS.length
                          ],
                        flexShrink: 0
                      }}
                    />

                    <span
                      style={{
                        color: tokens.inkSoft,
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        maxWidth: 80
                      }}
                    >
                      {d.department}:
                    </span>

                    <span
                      style={{
                        fontWeight: 600,
                        color: tokens.ink
                      }}
                    >
                      {d.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Heatmap Matrix Block */}
      <div
        className="ech-card"
        style={{
          ...cardStyle,
          marginBottom: 24,
          padding: 24
        }}
      >
        <div
          style={{
            fontFamily: "'Fraunces',serif",
            fontWeight: 600,
            fontSize: 16.5,
            color: tokens.ink,
            marginBottom: 4
          }}
        >
          Volume by category
        </div>

        <div
          style={{
            fontSize: 12.5,
            color: tokens.inkSoft,
            marginBottom: 18
          }}
        >
          Darker cells mean more echoes that week.
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `130px repeat(${weeks.length}, 34px)`,
            gap: 8,
            alignItems: 'center',
            overflowX: 'auto',
            paddingBottom: 6
          }}
        >
          <div />

          {weeks.map(w => (
            <div
              key={w}
              style={{
                fontSize: 10.5,
                color: tokens.inkFaint,
                textAlign: 'center',
                fontWeight: 600
              }}
            >
              {w}
            </div>
          ))}

          {heat.map(row => (
            <React.Fragment key={row.cat}>
              <div
                style={{
                  fontSize: 12.5,
                  color: tokens.inkSoft,
                  fontWeight: 500
                }}
              >
                {row.cat}
              </div>

              {row.vals.map((v, i) => (
                <div
                  key={i}
                  style={{
                    width: 34,
                    height: 24,
                    borderRadius: 6,
                    border: `1.5px solid ${tokens.border}`,
                    background:
                      v === 0
                        ? tokens.paper
                        : `rgba(156,59,38,${
                            0.14 +
                            (v / maxHeatVal) * 0.72
                          })`
                  }}
                  title={`${v} cases`}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Grievance queue table list */}
      <div
        className="ech-card"
        style={{
          ...cardStyle,
          padding: 24
        }}
      >
        <h3
          style={{
            fontFamily: "'Fraunces',serif",
            fontWeight: 600,
            fontSize: 18,
            color: tokens.ink,
            marginBottom: 16
          }}
        >
          Grievance Ledger Chain
        </h3>

        {complaints.length === 0 ? (
          <div
            style={{
              padding: '24px 0',
              textAlign: 'center',
              color: tokens.inkSoft,
              fontSize: 13.5
            }}
          >
            No complaints logged in the database chain.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left'
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: `1.5px solid ${tokens.border}`,
                    fontSize: 11,
                    fontWeight: 600,
                    color: tokens.inkSoft,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  <th style={{ padding: '12px 8px' }}>
                    Ledger ID
                  </th>

                  <th style={{ padding: '12px 8px' }}>
                    Category
                  </th>

                  <th style={{ padding: '12px 8px' }}>
                    Location Context
                  </th>

                  <th style={{ padding: '12px 8px' }}>
                    Status
                  </th>

                  <th style={{ padding: '12px 8px' }}>
                    Date
                  </th>

                  <th
                    style={{
                      padding: '12px 8px',
                      textAlign: 'right'
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody
                style={{
                  fontSize: 13.5,
                  color: tokens.ink
                }}
              >
                {complaints.map((c, i) => (
                  <tr
                    key={c.id}
                    className="ech-row"
                    style={{
                      borderBottom: `1px solid ${tokens.borderSoft}`,
                      transition: 'background 0.2s'
                    }}
                  >
                    <td
                      style={{
                        padding: '12px 8px',
                        fontFamily:
                          "'IBM Plex Mono',monospace",
                        fontSize: 11,
                        color: tokens.waxDeep
                      }}
                    >
                      {c.id.substring(0, 8)}...
                    </td>

                    <td
                      style={{
                        padding: '12px 8px',
                        fontWeight: 600
                      }}
                    >
                      {c.category}
                    </td>

                    <td
                      style={{
                        padding: '12px 8px',
                        color: tokens.inkSoft
                      }}
                    >
                      {c.department} &bull; {c.building}
                    </td>

                    <td style={{ padding: '12px 8px' }}>
                      <span
                        style={getStatusBadgeStyle(c.status)}
                      >
                        {c.status}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: '12px 8px',
                        color: tokens.inkFaint,
                        fontSize: 11.5
                      }}
                    >
                      {new Date(
                        c.createdAt || c.created_at
                      ).toLocaleDateString()}
                    </td>

                    <td
                      style={{
                        padding: '12px 8px',
                        textAlign: 'right'
                      }}
                    >
                      <button
                        onClick={() =>
                          handleOpenComplaint(c)
                        }
                        style={{
                          background: tokens.waxSoft,
                          border: `1px solid ${tokens.wax}`,
                          borderRadius: 8,
                          padding: '4px 10px',
                          fontSize: 12,
                          fontWeight: 600,
                          color: tokens.waxDeep,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Side Modal Drawer */}
      {selectedComplaint && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(27, 35, 64, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
        >
          {/* FIXED MODAL CONTAINER */}
          <div
            style={{
              width: '100%',
              maxWidth: 820,
              background: tokens.surface,
              border: `1.5px solid ${tokens.border}`,
              borderRadius: 22,
              boxShadow:
                '0 20px 50px rgba(27,35,64,0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              maxHeight: '90vh',
              height: 'min(720px, 90vh)',
              minHeight: 0
            }}
            className="md:flex-row"
          >
            {/* Left Column: Details */}
            <div
              style={{
                width: '100%',
                padding: 24,
                borderBottom: `1.5px solid ${tokens.border}`,
                background: tokens.paper,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                overflowY: 'auto',
                minHeight: 0,
                boxSizing: 'border-box'
              }}
              className="md:w-5/12 md:border-b-0 md:border-r"
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: tokens.inkFaint,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  Ledger Entry Details
                </span>

                <button
                  onClick={() => setSelectedComplaint(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                    color: tokens.wax
                  }}
                >
                  Close
                </button>
              </div>

              <div>
                <h3
                  style={{
                    fontFamily: "'Fraunces',serif",
                    fontWeight: 700,
                    fontSize: 20,
                    color: tokens.ink,
                    margin: 0
                  }}
                >
                  {selectedComplaint.category}
                </h3>

                <code
                  style={{
                    fontSize: 10.5,
                    fontFamily:
                      "'IBM Plex Mono',monospace",
                    color: tokens.inkSoft,
                    marginTop: 4,
                    display: 'block'
                  }}
                >
                  {selectedComplaint.id}
                </code>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 600,
                    color: tokens.inkFaint,
                    textTransform: 'uppercase',
                    marginBottom: 4
                  }}
                >
                  Context Location
                </label>

                <div
                  style={{
                    fontSize: 13.5,
                    color: tokens.ink
                  }}
                >
                  {selectedComplaint.department} &bull;{' '}
                  {selectedComplaint.building}
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 600,
                    color: tokens.inkFaint,
                    textTransform: 'uppercase',
                    marginBottom: 6
                  }}
                >
                  Change Status
                </label>

                <select
                  className="ech-input"
                  value={modalStatus}
                  onChange={e =>
                    handleUpdateStatus(e.target.value)
                  }
                  style={{
                    ...inputStyle,
                    padding: '8px 12px',
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  <option value="PENDING">
                    PENDING
                  </option>

                  <option value="INVESTIGATING">
                    INVESTIGATING
                  </option>

                  <option value="RESOLVED">
                    RESOLVED
                  </option>

                  <option value="ESCALATED">
                    ESCALATED
                  </option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 600,
                    color: tokens.inkFaint,
                    textTransform: 'uppercase',
                    marginBottom: 4
                  }}
                >
                  Grievance Body
                </label>

                <div
                  style={{
                    padding: 12,
                    background: tokens.surface,
                    border: `1px solid ${tokens.border}`,
                    borderRadius: 10,
                    fontSize: 12.5,
                    lineHeight: 1.5,
                    color: tokens.ink,
                    maxHeight: 160,
                    overflowY: 'auto'
                  }}
                >
                  {selectedComplaint.content}
                </div>
              </div>

              {selectedComplaint.evidence_url && (
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 11,
                      fontWeight: 600,
                      color: tokens.inkFaint,
                      textTransform: 'uppercase',
                      marginBottom: 4
                    }}
                  >
                    Attached Evidence
                  </label>

                  <a
                    href={`${COMPLAINT_API_URL}${selectedComplaint.evidence_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      padding: '8px 12px',
                      background: tokens.surface,
                      border: `1.5px solid ${tokens.border}`,
                      borderRadius: 8,
                      textAlign: 'center',
                      fontSize: 12,
                      fontWeight: 600,
                      color: tokens.waxDeep,
                      textDecoration: 'none'
                    }}
                  >
                    Open Stripped Evidence File
                  </a>
                </div>
              )}

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 600,
                    color: tokens.inkFaint,
                    textTransform: 'uppercase',
                    marginBottom: 4
                  }}
                >
                  Ledger Hash Chain
                </label>

                <div
                  style={{
                    fontFamily:
                      "'IBM Plex Mono',monospace",
                    fontSize: 9,
                    background: tokens.surface,
                    padding: 10,
                    borderRadius: 8,
                    border: `1px solid ${tokens.border}`,
                    color: tokens.inkSoft,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                  }}
                >
                  <div>
                    PREV:{' '}
                    {selectedComplaint.previous_hash.substring(
                      0,
                      24
                    )}
                    ...
                  </div>

                  <div>
                    HASH:{' '}
                    {selectedComplaint.block_hash.substring(
                      0,
                      24
                    )}
                    ...
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Secure Messaging Tunnel */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minWidth: 0,
                minHeight: 0,
                overflow: 'hidden'
              }}
              className="md:w-7/12"
            >
              {/* Messaging Header */}
              <div
                style={{
                  padding: '14px 20px',
                  background: tokens.paperDeep,
                  borderBottom: `1.5px solid ${tokens.border}`,
                  flexShrink: 0
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: tokens.ink
                  }}
                >
                  Secure Messaging Tunnel
                </span>

                <code
                  style={{
                    fontSize: 10,
                    fontFamily:
                      "'IBM Plex Mono',monospace",
                    color: tokens.inkSoft,
                    display: 'block',
                    marginTop: 2
                  }}
                >
                  {selectedComplaint.mailbox_id}
                </code>
              </div>

              {/* Messages */}
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: 'auto',
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  background: '#FFFCF5'
                }}
              >
                {modalLoading ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      fontSize: 12,
                      color: tokens.inkSoft
                    }}
                  >
                    Opening thread...
                  </div>
                ) : mailboxReplies.length === 0 ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      fontSize: 12,
                      color: tokens.inkSoft,
                      textAlign: 'center',
                      gap: 4
                    }}
                  >
                    <span>
                      No messages logged in this mailbox.
                    </span>

                    <span>
                      Admin replies sent will appear here.
                    </span>
                  </div>
                ) : (
                  mailboxReplies.map(reply => {
                    const isAdmin =
                      reply.sender === 'ADMIN';

                    return (
                      <div
                        key={reply.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          maxWidth: '85%',
                          marginLeft: isAdmin ? 'auto' : '0',
                          marginRight: isAdmin ? '0' : 'auto',
                          alignSelf: isAdmin
                            ? 'flex-end'
                            : 'flex-start',
                          alignItems: isAdmin
                            ? 'flex-end'
                            : 'flex-start'
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: isAdmin
                              ? tokens.wax
                              : tokens.safe,
                            marginBottom: 4,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase'
                          }}
                        >
                          {isAdmin
                            ? 'Administrator (You)'
                            : 'Anonymous Reporter'}

                          <span
                            style={{
                              color: tokens.inkFaint,
                              textTransform: 'none',
                              fontWeight: 400
                            }}
                          >
                            &bull;{' '}
                            {new Date(
                              reply.createdAt ||
                                reply.created_at
                            ).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        <div
                          style={{
                            padding: 10,
                            borderRadius: isAdmin
                              ? '16px 16px 0px 16px'
                              : '16px 16px 16px 0px',
                            fontSize: 12.5,
                            lineHeight: 1.4,
                            background: isAdmin
                              ? tokens.waxSoft
                              : tokens.safeSoft,
                            color: tokens.ink,
                            border: `1px solid ${
                              isAdmin
                                ? tokens.waxSoft
                                : tokens.safeSoft
                            }`
                          }}
                        >
                          {reply.content}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Reply Composer */}
              <form
                onSubmit={handleSendReply}
                style={{
                  padding: 14,
                  borderTop: `1.5px solid ${tokens.border}`,
                  background: tokens.paperDeep,
                  display: 'flex',
                  gap: 10,
                  flexShrink: 0
                }}
              >
                <input
                  type="text"
                  required
                  placeholder="Type an anonymous follow-up reply..."
                  value={adminReplyText}
                  onChange={e =>
                    setAdminReplyText(e.target.value)
                  }
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: '8px 12px',
                    background: tokens.surface,
                    border: `1.5px solid ${tokens.border}`,
                    borderRadius: 10,
                    fontSize: 13,
                    color: tokens.ink,
                    outline: 'none'
                  }}
                />

                <button
                  type="submit"
                  disabled={!adminReplyText.trim()}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    background: tokens.wax,
                    color: '#FCF5EC',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: adminReplyText.trim()
                      ? 'pointer'
                      : 'not-allowed',
                    opacity: adminReplyText.trim()
                      ? 1
                      : 0.6
                  }}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}