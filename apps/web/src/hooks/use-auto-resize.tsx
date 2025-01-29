import { type RefObject, useEffect } from "react";

export function useAutoResizeTextArea(textAreaRef: RefObject<HTMLTextAreaElement>) {
	useEffect(() => {
		const textarea = textAreaRef.current;
		if (!textarea) return;

		const adjustHeight = () => {
			textarea.style.height = "auto";
			textarea.style.height = `${textarea.scrollHeight}px`;
		};

		textarea.addEventListener("input", adjustHeight);
		adjustHeight();

		return () => textarea.removeEventListener("input", adjustHeight);
	}, [textAreaRef]);
}
