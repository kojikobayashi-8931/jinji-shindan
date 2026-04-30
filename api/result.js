export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get('level') || '3';
  const score = searchParams.get('score') || '0';
  const username = searchParams.get('username') || 'あなた';

  const baseUrl = 'https://jinji-shindan.nodia.co.jp';
  const ogImageUrl = `${baseUrl}/api/og?level=${level}&score=${score}&username=${encodeURIComponent(username)}`;

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>人事段位チェック | 判定結果</title>
    
    <!-- OGP Settings -->
    <meta property="og:title" content="人事段位チェック | 判定結果" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${baseUrl}/" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:description" content="人事の知識、どれくらい？正解率であなたの段位を手軽に判定" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="人事段位チェック | 判定結果" />
    <meta name="twitter:description" content="人事の知識、どれくらい？正解率であなたの段位を手軽に判定" />
    <meta name="twitter:image" content="${ogImageUrl}" />
    
    <!-- 即時リダイレクト（人向け） -->
    <script>
        window.location.replace("${baseUrl}/");
    </script>
    <meta http-equiv="refresh" content="0;url=${baseUrl}/">
</head>
<body style="background-color: #f8fafc; font-family: sans-serif; text-align: center; padding-top: 20vh;">
    <p>トップページへ移動しています...</p>
    <p>移動しない場合は <a href="${baseUrl}/">こちら</a> をクリックしてください。</p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 's-maxage=86400, stale-while-revalidate',
    },
  });
}
