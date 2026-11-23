"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("demo@phy10615.vn");
  const [password, setPassword] = useState("Demo@123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isRegister) {
      const res = await authClient.signUp.email({
        email,
        password,
        name: name || email.split("@")[0],
      });
      if (res.error) {
        setError(res.error.message || "Đăng ký thất bại");
        setLoading(false);
        return;
      }
    } else {
      const res = await authClient.signIn.email({
        email,
        password,
      });
      if (res.error) {
        setError(res.error.message || "Sai email hoặc mật khẩu");
        setLoading(false);
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isRegister ? "Đăng ký tài khoản" : "Đăng nhập Finance Planner"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tài khoản demo mặc định đã điền sẵn bên dưới
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 text-rose-600 text-sm border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Họ tên</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Võ Hoàng Phúc"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg text-sm transition cursor-pointer disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : isRegister ? "Tạo tài khoản" : "Đăng nhập"}
          </button>
        </form>

        <div className="text-center text-sm text-slate-600">
          {isRegister ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
            className="text-slate-900 font-semibold underline cursor-pointer"
          >
            {isRegister ? "Đăng nhập ngay" : "Đăng ký mới"}
          </button>
        </div>
      </div>
    </main>
  );
}