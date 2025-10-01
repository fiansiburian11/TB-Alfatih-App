import PasswordInput from "@/components/layout/layout-password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent } from "@/components/ui/tabs";

export default function LoginForm() {
  return (
    <div className="w-[400px]  p-6  space-y-4">
      <h1 className="font-bold text-[#0892D8] text-center text-2xl">KLIKSALES</h1>
      <h1 className="text-center">Masuk Ke Akun Kliksales</h1>

      <Tabs defaultValue="account" className="space-y-3">
        <TabsContent value="account" className="space-y-3">
          <Input
            type="username"
            id="username"
            placeholder="Username"
            className="
    border border-[#0892D8]/40
    focus-visible:border-[#067ab1]
    focus-visible:ring-[#067ab1]/50
    placeholder-shown:border-[#0892D8]/40
    not-placeholder-shown:border-[#0892D8] placeholder:text-slate-300 bg-slate-50
  "
          />

          <PasswordInput />
          <Button className="w-full bg-[#0892D8] text-white hover:bg-[#067ab1] font-extralight cursor-pointer">Masuk</Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
