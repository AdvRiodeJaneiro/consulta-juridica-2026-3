export const config = {
  // Executa o middleware apenas na página principal e no index para otimização máxima
  matcher: ['/', '/index.html'],
};

export async function middleware(request: Request) {
  try {
    const url = new URL(request.url);

    // Evita loop infinito se a requisição de bypass já estiver no parâmetro
    if (url.searchParams.has('bypass-middleware')) {
      return;
    }

    const SUPABASE_URL = "https://roqhysljzhzcsyuiumpw.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcWh5c2xqemh6Y3N5dWl1bXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMzE3NzgsImV4cCI6MjA4NTkwNzc3OH0.AyFrLp0tQq0w8tQC-zLselO_UomIZYAbEBQqCGSq9y0";

    // 1. Consulta leve e direta ao REST API do Supabase (Edge-native)
    const dbResponse = await fetch(`${SUPABASE_URL}/rest/v1/admin_settings?select=seo_title,seo_description,seo_keywords&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!dbResponse.ok) return;
    const data = await dbResponse.json();
    const seo = data[0];

    if (!seo) return;

    // 2. Busca o HTML original do site direto no servidor de origem com bypass
    const indexUrl = new URL('/index.html', request.url);
    indexUrl.searchParams.set('bypass-middleware', 'true');
    const htmlResponse = await fetch(indexUrl);

    if (!htmlResponse.ok) return;
    let html = await htmlResponse.text();

    const seoTitle = seo.seo_title || "Magalhães & Gomes - IA Jurídica";
    const seoDesc = seo.seo_description || "Excelência jurídica com a agilidade da inteligência artificial. Faça sua consulta estratégica online.";
    const seoKeywords = seo.seo_keywords || "advogado, consulta juridica, inteligencia artificial, juros abusivos, direito, escritorio de advocacia";

    // 3. Substituições cirúrgicas no HTML em memória do servidor
    html = html.replace(/<title>.*?<\/title>/, `<title>${seoTitle}</title>`);

    // Bloco de meta tags pronto para Google, WhatsApp e redes sociais
    const metaTags = `
    <title>${seoTitle}</title>
    <meta name="description" content="${seoDesc}">
    <meta name="keywords" content="${seoKeywords}">
    <meta property="og:title" content="${seoTitle}">
    <meta property="og:description" content="${seoDesc}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url.href}">
    <meta property="og:image" content="https://advogadoriodejaneiro.com/wp-content/uploads/2020/08/cropped-logo-MG-perfil-192x192.jpg">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${seoTitle}">
    <meta name="twitter:description" content="${seoDesc}">
    `;

    // Remove meta description antiga se houver para evitar duplicidade
    html = html.replace(/<meta name="description".*?>/g, '');

    // Injeta o bloco antes do fechamento do head
    html = html.replace('</head>', `${metaTags}\n</head>`);

    // 4. Devolve o HTML alterado com cabeçalhos corretos de resposta
    return new Response(html, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=0, must-revalidate',
      },
    });

  } catch (error) {
    console.error("Vercel Edge SEO Middleware Error:", error);
    // Em caso de qualquer erro técnico de conexão, o middleware falha silenciosamente e deixa o site carregar normalmente
  }
}