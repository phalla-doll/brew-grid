import { NextResponse } from 'next/server';

// Simple in-memory cache to avoid fetching the 30MB+ JSON on every request
let cachedFormulae: any[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 3600 * 1000; // 1 hour

async function getFormulae() {
  const now = Date.now();
  if (cachedFormulae && (now - lastFetchTime < CACHE_TTL)) {
    return cachedFormulae;
  }

  try {
    const res = await fetch('https://formulae.brew.sh/api/formula.json', {
      next: { revalidate: 3600 }
    });
    if (!res.ok) throw new Error('Failed to fetch from Homebrew');
    
    const data = await res.json();
    cachedFormulae = data;
    lastFetchTime = now;
    return data;
  } catch (error) {
    console.error("Error fetching formula:", error);
    return [];
  }
}

const FEATURED = new Set([
  'wget', 'node', 'python@3.12', 'git', 'ffmpeg', 'htop', 'curl', 'bat', 'jq', 
  'ripgrep', 'fzf', 'tmux', 'neovim', 'go', 'rust', 'postgresql@14', 'redis',
  'imagemagick', 'cmake', 'tree', 'gnupg', 'yarn', 'pnpm', 'docker', 'helm'
]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() || '';
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const page = parseInt(searchParams.get('page') || '1', 10);
  
  const formulae: any[] = await getFormulae();
  
  let results = formulae;
  
  if (query) {
    results = formulae.filter((f: any) => 
      f.name?.toLowerCase().includes(query) || 
      (f.desc && f.desc.toLowerCase().includes(query))
    );
  } else {
    results = [...formulae].sort((a, b) => {
      const aFeatured = FEATURED.has(a.name) ? 1 : 0;
      const bFeatured = FEATURED.has(b.name) ? 1 : 0;
      return bFeatured - aFeatured;
    });
  }

  
  const start = (page - 1) * limit;
  const paginated = results.slice(start, start + limit);
  
  return NextResponse.json({
    data: paginated,
    total: results.length,
    page,
    limit,
  });
}
