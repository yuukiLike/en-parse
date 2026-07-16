type CopyNotesFeedbackInput = {
  copied: boolean;
  persisted: boolean;
};

type CopyNotesFeedback = {
  color: "red" | "teal" | "yellow";
  message: string;
};

export function getCopyNotesFeedback({
  copied,
  persisted,
}: CopyNotesFeedbackInput): CopyNotesFeedback {
  if (copied && persisted) {
    return { color: "teal", message: "笔记已复制，并保存为本地记忆。" };
  }

  if (copied) {
    return {
      color: "yellow",
      message: "笔记已复制，但本地存储不可用；请导出 JSON 保留内容。",
    };
  }

  if (persisted) {
    return { color: "yellow", message: "浏览器未开放剪贴板权限，但记忆已保存。" };
  }

  return {
    color: "red",
    message: "笔记未能复制，本地存储也不可用；请先导出 JSON 保留内容。",
  };
}
