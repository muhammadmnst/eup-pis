export default function NotFound() {
  return (
    <div className="section">
      <div className="container-app text-center py-24">
        <p className="text-6xl font-bold text-slate-700 mb-4">404</p>
        <h1 className="text-2xl font-bold text-slate-300 mb-2">Project Tidak Ditemukan</h1>
        <p className="text-slate-500 mb-8">Project yang Anda cari tidak ada atau telah dihapus.</p>
        <a href="/" className="btn-primary inline-flex">← Kembali ke Beranda</a>
      </div>
    </div>
  )
}
