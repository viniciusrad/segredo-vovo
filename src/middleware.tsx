import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas públicas que não precisam de autenticação
const rotasPublicas = ['/login', '/cadastro']

// Rotas que requerem perfil específico
const rotasAdmin = ['/usuarios', '/pontos-venda']
const rotasAtendente = ['/pedidos']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Verifica se é uma rota pública
  if (rotasPublicas.includes(pathname)) {
    console.log('Rota pública')
    return NextResponse.next()
  }

  // Recupera a sessão do cookie
  const session = request.cookies.get('session')?.value

  // Se não houver sessão e não for rota pública, redireciona para login
  if (!session) {
    console.log('Não há sessão')
    const url = new URL('/login', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  try {
    // Decodifica a sessão
    const usuario = JSON.parse(session)
    
    // Verifica permissões baseadas no perfil
    if (rotasAdmin.some(rota => pathname.startsWith(rota)) && usuario.perfil !== 'admin') {
      console.log('Usuário não é admin')
      return NextResponse.redirect(new URL('/', request.url))
    }

    if (rotasAtendente.some(rota => pathname.startsWith(rota)) && 
        !['admin', 'atendente'].includes(usuario.perfil)) {
      console.log('Usuário não é atendente')
      return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Erro ao decodificar a sessão', error)
    // Se houver erro ao decodificar a sessão, remove o cookie e redireciona para login
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('session')
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}