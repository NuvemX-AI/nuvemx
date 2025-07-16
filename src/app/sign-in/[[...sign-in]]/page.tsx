import { SignIn } from "@clerk/nextjs";
import React from "react";

export default function SignInPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <SignIn />
    </div>
  );
} 