import { useEffect, useId, useRef, useState } from "react";
import { FileAudio, FileVideo, ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilePickerProps {
	label: string;
	accept: string;
	kind: "image" | "audio" | "video";
	file: File | null;
	onChange: (file: File | null) => void;
	hint?: string;
	optional?: boolean;
}

const MAX_BYTES = 25 * 1024 * 1024;

const icons = { image: ImagePlus, audio: FileAudio, video: FileVideo };

const formatSize = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const FilePicker = ({ label, accept, kind, file, onChange, hint, optional }: FilePickerProps) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const id = useId();
	const [preview, setPreview] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [dragging, setDragging] = useState(false);
	const Icon = icons[kind];

	useEffect(() => {
		if (!file || kind !== "image") {
			setPreview(null);
			return;
		}
		const url = URL.createObjectURL(file);
		setPreview(url);
		return () => URL.revokeObjectURL(url);
	}, [file, kind]);

	const accepts = (candidate: File) => candidate.type.startsWith(`${kind}/`);

	const select = (candidate: File | undefined) => {
		if (!candidate) return;
		if (!accepts(candidate)) {
			setError(`Choose a ${kind} file`);
			return;
		}
		if (candidate.size > MAX_BYTES) {
			setError(`File is ${formatSize(candidate.size)}. The limit is ${formatSize(MAX_BYTES)}.`);
			return;
		}
		setError(null);
		onChange(candidate);
	};

	return (
		<div className="space-y-1.5">
			<label htmlFor={id} className="text-sm font-medium text-white">
				{label}
				{optional && <span className="font-normal text-subdued"> (optional)</span>}
			</label>
			<input
				id={id}
				ref={inputRef}
				type="file"
				accept={accept}
				className="sr-only"
				onChange={(e) => {
					select(e.target.files?.[0]);
					e.target.value = "";
				}}
			/>
			<div
				role="button"
				tabIndex={0}
				onClick={() => inputRef.current?.click()}
				onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
				onDragOver={(e) => {
					e.preventDefault();
					setDragging(true);
				}}
				onDragLeave={() => setDragging(false)}
				onDrop={(e) => {
					e.preventDefault();
					setDragging(false);
					select(e.dataTransfer.files[0]);
				}}
				className={cn(
					"flex cursor-pointer items-center gap-3 rounded-lg border border-dashed p-3 transition-colors",
					dragging ? "border-primary bg-primary/10" : "border-white/20 hover:border-white/40 hover:bg-white/5"
				)}
			>
				{preview ? (
					<img src={preview} alt="" className="size-14 rounded object-cover" />
				) : (
					<span className="grid size-14 place-items-center rounded bg-white/5 text-subdued">
						<Icon className="size-6" />
					</span>
				)}
				<span className="min-w-0 flex-1 text-sm">
					{file ? (
						<>
							<span className="block truncate font-medium text-white">{file.name}</span>
							<span className="text-subdued">{formatSize(file.size)}</span>
						</>
					) : (
						<>
							<span className="block font-medium text-white">Choose or drop a file</span>
							{hint && <span className="text-subdued">{hint}</span>}
						</>
					)}
				</span>
				{file && (
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onChange(null);
						}}
						className="grid size-8 place-items-center rounded-full text-subdued hover:bg-white/10 hover:text-white"
						aria-label={`Remove ${label.toLowerCase()}`}
					>
						<X className="size-4" />
					</button>
				)}
			</div>
			{error && <p className="text-xs text-red-400">{error}</p>}
		</div>
	);
};

export default FilePicker;
