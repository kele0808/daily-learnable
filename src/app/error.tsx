"use client";

import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CircleAlert } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-16">
      <Alert variant="destructive">
        <CircleAlert />
        <AlertTitle>日报生成失败</AlertTitle>
        <AlertDescription>
          {error.message || "向 GitHub 拉仓库时出错了。请稍后重试；本机可设置 GITHUB_TOKEN 提高额度。"}
        </AlertDescription>
      </Alert>
      <Button className="mt-4 w-fit" onClick={() => reset()}>
        再试一次
      </Button>
    </div>
  );
}
