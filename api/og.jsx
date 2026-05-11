import React from 'react';
import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

// 必要な文字だけを含むサブセットフォントをGoogle FontsからTTF形式で取得する関数
async function loadGoogleFont(family, text) {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}&text=${encodeURIComponent(text)}`;
  // TTF形式を強制するために古いブラウザのUser-Agentを指定
  const css = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
    },
  }).then((res) => res.text());
  
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);
  if (resource) {
    const res = await fetch(resource[1]);
    return await res.arrayBuffer();
  }
  return null;
}

const levelsData = {
    1: { name: '人事の卵', mainColor: '#F5C842', bgColor: '#FFFBF0' },
    2: { name: '人事の歩', mainColor: '#5CC47E', bgColor: '#F0FFF6' },
    3: { name: '人事の道', mainColor: '#5A8FDB', bgColor: '#F0F6FF' },
    4: { name: '人事の匠', mainColor: '#C86DD7', bgColor: '#FDF0FF' },
    5: { name: '人事の達人', mainColor: '#E86A2A', bgColor: '#FFF8F5' }
};

const Lv1Icon = () => (
<svg viewBox="0 0 200 220" width="220" height="220">
  <rect width="200" height="220" fill="white" rx="16"/>
  <ellipse cx="100" cy="130" rx="55" ry="68" fill="#FFF3C4" stroke="#F5C842" strokeWidth="3"/>
  <polyline points="100,64 91,82 103,97 93,113" stroke="#F5A623" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  <circle cx="80" cy="122" r="11" fill="white" stroke="#333" strokeWidth="2"/>
  <circle cx="120" cy="122" r="11" fill="white" stroke="#333" strokeWidth="2"/>
  <circle cx="82" cy="124" r="5.5" fill="#333"/>
  <circle cx="122" cy="124" r="5.5" fill="#333"/>
  <circle cx="84" cy="122" r="2" fill="white"/>
  <circle cx="124" cy="122" r="2" fill="white"/>
  <path d="M82,142 Q100,155 118,142" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  <ellipse cx="67" cy="142" rx="11" ry="6" fill="#FFB3C1" opacity="0.65"/>
  <ellipse cx="133" cy="142" rx="11" ry="6" fill="#FFB3C1" opacity="0.65"/>
  <line x1="100" y1="64" x2="100" y2="44" stroke="#7BC67E" strokeWidth="3" strokeLinecap="round"/>
  <ellipse cx="100" cy="38" rx="11" ry="8" fill="#7BC67E" transform="rotate(-20 100 38)"/>
  <ellipse cx="113" cy="48" rx="9" ry="6" fill="#5DAE61" transform="rotate(30 113 48)"/>
</svg>
);

const Lv2Icon = () => (
<svg viewBox="0 0 200 220" width="220" height="220">
  <rect width="200" height="220" fill="white" rx="16"/>
  <circle cx="100" cy="130" r="68" fill="#D6F5E3" stroke="#5CC47E" strokeWidth="3"/>
  <rect x="58" y="68" width="84" height="11" rx="2" fill="#4A7C59"/>
  <polygon points="100,54 134,68 100,68 66,68" fill="#4A7C59"/>
  <line x1="134" y1="68" x2="140" y2="86" stroke="#4A7C59" strokeWidth="3" strokeLinecap="round"/>
  <circle cx="140" cy="91" r="6" fill="#F5C842"/>
  <path d="M72,114 Q84,107 96,114" stroke="#5A4A3A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  <path d="M104,114 Q116,107 128,114" stroke="#5A4A3A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  <ellipse cx="84" cy="126" rx="11" ry="10" fill="white" stroke="#333" strokeWidth="2"/>
  <ellipse cx="116" cy="126" rx="11" ry="10" fill="white" stroke="#333" strokeWidth="2"/>
  <circle cx="85" cy="128" r="5.5" fill="#333"/>
  <circle cx="117" cy="128" r="5.5" fill="#333"/>
  <circle cx="87" cy="126" r="2" fill="white"/>
  <circle cx="119" cy="126" r="2" fill="white"/>
  <path d="M82,146 Q100,158 118,146" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  <ellipse cx="68" cy="146" rx="12" ry="7" fill="#FFB3C1" opacity="0.55"/>
  <ellipse cx="132" cy="146" rx="12" ry="7" fill="#FFB3C1" opacity="0.55"/>
</svg>
);

const Lv3Icon = () => (
<svg viewBox="0 0 200 220" width="220" height="220">
  <rect width="200" height="220" fill="white" rx="16"/>
  <circle cx="100" cy="128" r="68" fill="#D2E6FF" stroke="#5A8FDB" strokeWidth="3"/>
  <path d="M36,112 Q56,56 100,50 Q144,56 164,112" fill="#5A3E28" stroke="#5A3E28" strokeWidth="1"/>
  <rect x="60" y="114" width="28" height="20" rx="6" fill="rgba(210,230,255,0.5)" stroke="#4A6FA8" strokeWidth="2.8"/>
  <rect x="112" y="114" width="28" height="20" rx="6" fill="rgba(210,230,255,0.5)" stroke="#4A6FA8" strokeWidth="2.8"/>
  <line x1="88" y1="124" x2="112" y2="124" stroke="#4A6FA8" strokeWidth="2.5"/>
  <line x1="58" y1="124" x2="60" y2="124" stroke="#4A6FA8" strokeWidth="2.5" strokeLinecap="round"/>
  <line x1="140" y1="124" x2="143" y2="124" stroke="#4A6FA8" strokeWidth="2.5" strokeLinecap="round"/>
  <circle cx="74" cy="124" r="5.5" fill="#333"/>
  <circle cx="126" cy="124" r="5.5" fill="#333"/>
  <circle cx="76" cy="122" r="2" fill="white"/>
  <circle cx="128" cy="122" r="2" fill="white"/>
  <path d="M78,148 Q100,162 122,148" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  <rect x="62" y="168" width="32" height="22" rx="3" fill="#F5C842" stroke="#C8A000" strokeWidth="1.5"/>
  <line x1="67" y1="175" x2="89" y2="175" stroke="#C8A000" strokeWidth="1.2"/>
  <line x1="67" y1="181" x2="89" y2="181" stroke="#C8A000" strokeWidth="1.2"/>
  <line x1="67" y1="186" x2="82" y2="186" stroke="#C8A000" strokeWidth="1.2"/>
</svg>
);

const Lv4Icon = () => (
<svg viewBox="0 0 200 220" width="220" height="220">
  <rect width="200" height="220" fill="white" rx="16"/>
  <circle cx="100" cy="128" r="68" fill="#F3D6FA" stroke="#C86DD7" strokeWidth="3"/>
  <path d="M34,118 Q42,56 100,48 Q158,56 166,118 Q144,76 100,74 Q56,76 34,118" fill="#3A2C50"/>
  <path d="M66,106 Q80,96 94,104" stroke="#3A2C50" strokeWidth="4" fill="none" strokeLinecap="round"/>
  <path d="M106,104 Q120,96 134,106" stroke="#3A2C50" strokeWidth="4" fill="none" strokeLinecap="round"/>
  <ellipse cx="80" cy="120" rx="13" ry="10" fill="white" stroke="#333" strokeWidth="2"/>
  <ellipse cx="120" cy="120" rx="13" ry="10" fill="white" stroke="#333" strokeWidth="2"/>
  <path d="M67,115 Q80,108 93,115" fill="#3A2C50"/>
  <path d="M107,115 Q120,108 133,115" fill="#3A2C50"/>
  <circle cx="80" cy="122" r="6" fill="#1A1A2E"/>
  <circle cx="120" cy="122" r="6" fill="#1A1A2E"/>
  <circle cx="82" cy="120" r="2.2" fill="white"/>
  <circle cx="122" cy="120" r="2.2" fill="white"/>
  <path d="M84,144 Q100,156 120,147" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  <polygon points="100,166 105,180 120,180 109,188 113,202 100,194 87,202 91,188 80,180 95,180" fill="#F5C842" stroke="#C8A000" strokeWidth="1.5"/>
  <circle cx="100" cy="182" r="4" fill="#C86DD7"/>
</svg>
);

const Lv5Icon = () => (
<svg viewBox="0 0 200 220" width="220" height="220">
  <rect width="200" height="220" fill="white" rx="16"/>
  <circle cx="100" cy="130" r="82" fill="none" stroke="#F5C842" strokeWidth="1.5" opacity="0.4"/>
  <circle cx="100" cy="130" r="73" fill="none" stroke="#F5A623" strokeWidth="1" opacity="0.25"/>
  <circle cx="100" cy="130" r="62" fill="#FFE3C8" stroke="#E86A2A" strokeWidth="3"/>
  <polygon points="100,60 84,72 70,54 64,76 100,67 136,76 130,54 116,72" fill="#F5C842" stroke="#C8A000" strokeWidth="2"/>
  <circle cx="100" cy="62" r="6" fill="#E86A2A"/>
  <circle cx="82" cy="72" r="4.5" fill="#5A8FDB"/>
  <circle cx="118" cy="72" r="4.5" fill="#5CC47E"/>
  <path d="M56,112 Q72,100 88,108" stroke="#BBBBBB" strokeWidth="5.5" fill="none" strokeLinecap="round"/>
  <path d="M112,108 Q128,100 144,112" stroke="#BBBBBB" strokeWidth="5.5" fill="none" strokeLinecap="round"/>
  <ellipse cx="78" cy="124" rx="12" ry="10" fill="white" stroke="#333" strokeWidth="2"/>
  <ellipse cx="122" cy="124" rx="12" ry="10" fill="white" stroke="#333" strokeWidth="2"/>
  <circle cx="78" cy="126" r="6" fill="#1A4A8A"/>
  <circle cx="122" cy="126" r="6" fill="#1A4A8A"/>
  <circle cx="80" cy="124" r="2.2" fill="white"/>
  <circle cx="124" cy="124" r="2.2" fill="white"/>
  <path d="M74,148 Q100,164 126,148" stroke="#555" strokeWidth="3" fill="none" strokeLinecap="round"/>
  <ellipse cx="100" cy="178" rx="30" ry="15" fill="#E8E0D8" stroke="#C8BFB0" strokeWidth="1.5"/>
  <path d="M74,166 Q100,184 126,166" fill="#E8E0D8" stroke="#C8BFB0" strokeWidth="1.5"/>
</svg>
);

const getIcon = (level) => {
  switch (level) {
    case 1: return <Lv1Icon />;
    case 2: return <Lv2Icon />;
    case 3: return <Lv3Icon />;
    case 4: return <Lv4Icon />;
    case 5: return <Lv5Icon />;
    default: return <Lv3Icon />;
  }
};

export default async function handler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const levelStr = searchParams.get('level') || '3';
    // const scoreStr = searchParams.get('score') || '0'; // 正解率は不要になったのでコメントアウトまたは削除
    const username = searchParams.get('username') || 'あなた';

    const level = parseInt(levelStr, 10);
    const data = levelsData[level] || levelsData[3];
    
    // 描画に必要な文字群
    const requiredChars = \`L0123456789%人事の卵歩道匠達人結果正解率段位チクェッbyNODIA \${username}さんの結果は...\`;
    
    // フォントデータを取得（太字）
    const fontData = await loadGoogleFont('Noto Sans JP:wght@700', requiredChars);

    const imageResp = new ImageResponse(
      (
        <div
          style={{
            backgroundColor: data.bgColor,
            width: '1200px',
            height: '630px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: '"Noto Sans JP"',
            padding: '0 60px',
          }}
        >
          {/* Left: Icon */}
          <div
            style={{
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'white',
              border: \`8px solid \${data.mainColor}\`,
              marginRight: '60px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
            }}
          >
            {getIcon(level)}
          </div>

          {/* Right: Text */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: '#555',
                marginBottom: 20,
              }}
            >
              {username}さんの結果は...
            </div>
            
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
              }}
            >
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 900,
                  color: data.mainColor,
                  marginRight: 16,
                }}
              >
                L{level}
              </div>
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 900,
                  color: data.mainColor,
                }}
              >
                {data.name}
              </div>
            </div>
          </div>
            
          {/* Footer branding */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              right: 60,
              fontSize: 20,
              fontWeight: 700,
              color: '#888',
            }}
          >
            人事段位チェック by NODIA
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: fontData
          ? [
              {
                name: 'Noto Sans JP',
                data: fontData,
                weight: 700,
                style: 'normal',
              },
            ]
          : undefined,
      }
    );

    return imageResp;
  } catch (e) {
    console.error(e);
    return new Response(\`Failed to generate the image: \${e.message}\`, { status: 500 });
  }
}
