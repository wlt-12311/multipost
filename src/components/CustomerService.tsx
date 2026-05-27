import { useState, useEffect } from 'react';

const CS_BTN_STYLE: React.CSSProperties = {
  position: 'fixed',
  right: 20,
  bottom: 120,
  width: 48,
  height: 48,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #667eea, #764ba2)',
  border: 'none',
  cursor: 'pointer',
  zIndex: 999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 16px rgba(102,126,234,.4)',
  transition: 'transform .2s, box-shadow .2s',
};

const OVERLAY_STYLE: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,.6)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  animation: 'fadeIn .2s ease',
};

const DIALOG_STYLE: React.CSSProperties = {
  background: '#1e1e3f',
  border: '1px solid #3a3a6a',
  borderRadius: 16,
  padding: 0,
  width: 420,
  maxWidth: '90vw',
  maxHeight: '85vh',
  overflow: 'auto',
  position: 'relative',
  boxShadow: '0 8px 40px rgba(0,0,0,.5)',
};

const CLOSE_BTN: React.CSSProperties = {
  position: 'absolute',
  top: 12,
  right: 14,
  background: 'transparent',
  border: 'none',
  color: '#8888aa',
  fontSize: 22,
  cursor: 'pointer',
  lineHeight: 1,
  padding: 4,
  zIndex: 1,
};

export default function CustomerService() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Inject keyframes once
    if (!document.getElementById('cs-keyframes')) {
      const style = document.createElement('style');
      style.id = 'cs-keyframes';
      style.textContent = `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <>
      {/* Float Button */}
      <button
        style={CS_BTN_STYLE}
        onClick={() => setOpen(true)}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(102,126,234,.6)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(102,126,234,.4)';
        }}
        title="微信客服"
      >
        <svg width="24" height="24" viewBox="0 0 1024 1024" fill="white">
          <path d="M864 409.6a192 192 0 0 1-37.888 349.44A256.064 256.064 0 0 1 576 960h-96a32 32 0 1 1 0-64h96a192.06 192.06 0 0 0 181.12-128H736a32 32 0 0 1-32-32V416a32 32 0 0 1 32-32h32c10.368 0 20.544.832 30.528 2.432a288 288 0 0 0-573.056 0A193 193 0 0 1 256 384h32a32 32 0 0 1 32 32v320a32 32 0 0 1-32 32h-32a192 192 0 0 1-117.76-345.6 288 288 0 0 1 546.56-157.44A192 192 0 0 1 864 409.6m-512-25.6a32 32 0 1 0 64 0 32 32 0 0 0-64 0m128 0a32 32 0 1 0 64 0 32 32 0 0 0-64 0" />
        </svg>
      </button>

      {/* Dialog Modal */}
      {open && (
        <div style={OVERLAY_STYLE} onClick={() => setOpen(false)}>
          <div style={DIALOG_STYLE} onClick={e => e.stopPropagation()} className="cs-dialog-anim">
            <button style={CLOSE_BTN} onClick={() => setOpen(false)}>✕</button>

            {/* Header */}
            <div style={{
              textAlign: 'center', padding: '24px 24px 12px',
              borderBottom: '1px solid #3a3a6a',
            }}>
              <h2 style={{ margin: 0, fontSize: 18, color: '#e8e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <svg width="20" height="20" viewBox="0 0 1024 1024" fill="#667eea">
                  <path d="M864 409.6a192 192 0 0 1-37.888 349.44A256.064 256.064 0 0 1 576 960h-96a32 32 0 1 1 0-64h96a192.06 192.06 0 0 0 181.12-128H736a32 32 0 0 1-32-32V416a32 32 0 0 1 32-32h32c10.368 0 20.544.832 30.528 2.432a288 288 0 0 0-573.056 0A193 193 0 0 1 256 384h32a32 32 0 0 1 32 32v320a32 32 0 0 1-32 32h-32a192 192 0 0 1-117.76-345.6 288 288 0 0 1 546.56-157.44A192 192 0 0 1 864 409.6m-512-25.6a32 32 0 1 0 64 0 32 32 0 0 0-64 0m128 0a32 32 0 1 0 64 0 32 32 0 0 0-64 0" />
                </svg>
                微信客服
              </h2>
            </div>

            {/* QR Code */}
            <div style={{ textAlign: 'center', padding: '20px 24px 12px' }}>
              <div style={{
                display: 'inline-flex', padding: 8, background: 'white',
                borderRadius: 8, border: '1px solid #3a3a6a',
              }}>
                <img
                  src="/images/yzr/kefu.png"
                  alt="微信客服二维码"
                  style={{ width: 160, height: 200, objectFit: 'cover', display: 'block' }}
                />
              </div>
              <h3 style={{ margin: '12px 0 4px', fontSize: 16, color: '#e8e8f0', fontWeight: 600 }}>
                扫码添加微信客服
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: '#8888aa' }}>
                扫描上方二维码，添加客服微信
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#666688' }}>
                客服工作时间：周一至周五 9:00-18:00
              </p>
            </div>

            {/* Contact Button */}
            <div style={{ textAlign: 'center', padding: '0 24px 16px' }}>
              <a
                href="mailto:contact@yuzhiran.com"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '10px 28px', borderRadius: 8,
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: '#fff', fontSize: 14, fontWeight: 600,
                  textDecoration: 'none', transition: 'opacity .2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '.85'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                <svg width="16" height="16" viewBox="0 0 1024 1024" fill="white">
                  <path d="M128 224v512a64 64 0 0 0 64 64h640a64 64 0 0 0 64-64V224zm0-64h768a64 64 0 0 1 64 64v512a128 128 0 0 1-128 128H192A128 128 0 0 1 64 736V224a64 64 0 0 1 64-64" />
                  <path d="M904 224 656.512 506.88a192 192 0 0 1-289.024 0L120 224zm-698.944 0 210.56 240.704a128 128 0 0 0 192.704 0L818.944 224z" />
                </svg>
                在线咨询
              </a>
            </div>

            {/* Quick Links */}
            <div style={{
              padding: '12px 24px 20px',
              borderTop: '1px solid #3a3a6a',
            }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 13, color: '#8888aa', fontWeight: 500 }}>
                快速导航
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[
                  { label: '云帆官网', href: 'https://www.yzrcloud.cn' },
                  { label: 'AI能力引擎', href: 'https://ai.yzrcloud.cn' },
                  { label: '多境', href: 'https://multiscene.yzrcloud.cn' },
                  { label: '用户协议', href: 'https://www.yzrcloud.cn/terms' },
                  { label: '隐私政策', href: 'https://www.yzrcloud.cn/privacy' },
                ].map(link => (
                  <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
                    style={{
                      fontSize: 12, color: '#8888aa', textDecoration: 'none',
                      padding: '3px 10px', borderRadius: 4,
                      border: '1px solid #3a3a6a',
                      transition: 'all .2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#667eea';
                      e.currentTarget.style.color = '#667eea';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#3a3a6a';
                      e.currentTarget.style.color = '#8888aa';
                    }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .cs-dialog-anim {
          animation: slideUp .25s ease;
        }
      `}</style>
    </>
  );
}
