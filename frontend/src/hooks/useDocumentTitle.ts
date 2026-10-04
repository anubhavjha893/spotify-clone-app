import { useEffect } from "react";
import { site } from "@/config/site";

export const useDocumentTitle = (title?: string | null) => {
	useEffect(() => {
		document.title = title ? `${title} | ${site.name}` : site.name;
		return () => {
			document.title = site.name;
		};
	}, [title]);
};
