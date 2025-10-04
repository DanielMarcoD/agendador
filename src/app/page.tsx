export default function Home() {
  return (
    <main className="d-flex flex-column align-items-center justify-content-center min-vh-100 text-center px-3">
      <h1 className="fw-semibold mb-3">Agendador</h1>
      <p className="text-secondary mb-4">Entre ou crie sua conta para acessar</p>
      <div className="d-flex gap-2">
        <a className="btn btn-primary" href="/login">Login</a>
        <a className="btn btn-outline-light" href="/register">Cadastrar</a>
      </div>
    </main>
  )
}
