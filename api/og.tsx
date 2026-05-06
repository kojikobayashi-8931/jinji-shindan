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
    1: { name: '人事の卵', img: 'lv1_egg.svg', mainColor: '#F5C842', bgColor: '#FFFBF0' },
    2: { name: '人事の歩', img: 'lv2_step.svg', mainColor: '#5CC47E', bgColor: '#F0FFF6' },
    3: { name: '人事の道', img: 'lv3_path.svg', mainColor: '#5A8FDB', bgColor: '#F0F6FF' },
    4: { name: '人事の匠', img: 'lv4_master.svg', mainColor: '#C86DD7', bgColor: '#FDF0FF' },
    5: { name: '人事の達人', img: 'lv5_grandmaster.svg', mainColor: '#E86A2A', bgColor: '#FFF8F5' }
};

export default async function handler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const levelStr = searchParams.get('level') || '3';
    const scoreStr = searchParams.get('score') || '0';
    const username = searchParams.get('username') || 'あなた';

    const level = parseInt(levelStr, 10);
    const data = levelsData[level] || levelsData[3];
    
    // 画像URL（SVG）
    const baseUrl = 'https://jinji-shindan.nodia.co.jp';
    const iconUrl = `${baseUrl}/${data.img}`;
    const logoUrl = `${baseUrl}/logo.png`;

    // 描画に必要な文字群
    const requiredChars = `L0123456789%人事の卵歩道匠達人結果正解率段位チクェッbyNODIA ${username}`;
    
    // フォントデータを取得（太字）
    const fontData = await loadGoogleFont('Noto Sans JP:wght@700', requiredChars);

    return new ImageResponse(
      (
        <div
          style={{
            backgroundColor: data.bgColor,
            width: '1200px',
            height: '630px',
            display: 'flex',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: '"Noto Sans JP"',
          }}
        >
          {/* NODIA Logo */}
          <img
            src={logoUrl}
            alt="NODIA"
            style={{
              position: 'absolute',
              top: 40,
              left: 40,
              height: 36,
            }}
          />

          {/* Left Area */}
          <div
            style={{
              width: '560px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '240px',
                height: '240px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                backgroundColor: 'white',
                border: `4px solid ${data.mainColor}`,
              }}
            >
              <img
                src={iconUrl}
                style={{ width: '180px', height: '180px', objectFit: 'contain' }}
              />
            </div>
            <div
              style={{
                fontSize: 64,
                fontWeight: 900,
                color: data.mainColor,
                lineHeight: 1,
                marginBottom: 12,
              }}
            >
              L{level}
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: data.mainColor,
              }}
            >
              {data.name}
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              position: 'absolute',
              left: 560,
              top: 115,
              width: 2,
              height: 400,
              backgroundColor: data.mainColor,
              opacity: 0.3,
            }}
          />

          {/* Right Area */}
          <div
            style={{
              width: '640px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: '#333',
                marginBottom: 30,
              }}
            >
              {username}の結果
            </div>
            
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'center',
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  fontSize: 160,
                  fontWeight: 900,
                  lineHeight: 1,
                  color: data.mainColor,
                }}
              >
                {scoreStr}
              </div>
              <div
                style={{
                  fontSize: 60,
                  fontWeight: 900,
                  color: data.mainColor,
                  marginLeft: 8,
                }}
              >
                %
              </div>
            </div>
            
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: '#666',
                marginBottom: 60,
              }}
            >
              正解率
            </div>
            
            <div
              style={{
                position: 'absolute',
                bottom: 40,
                fontSize: 18,
                fontWeight: 700,
                color: '#888',
              }}
            >
              人事段位チェック by NODIA
            </div>
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
  } catch (e) {
    console.log(e.message);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
