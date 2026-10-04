import { useState } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { axiosInstance, getErrorMessage } from "@/lib/axios";
import { formatTime } from "@/lib/format";
import { useMusicStore } from "@/stores/useMusicStore";
import FilePicker from "./FilePicker";

const NO_ALBUM = "none";

const emptyForm = { title: "", artist: "", album: NO_ALBUM, duration: 0 };

// Reads the duration from the file's metadata so it never has to be typed in.
const readDuration = (file: File) =>
	new Promise<number>((resolve) => {
		const url = URL.createObjectURL(file);
		const audio = new Audio();
		audio.preload = "metadata";
		audio.onloadedmetadata = () => {
			URL.revokeObjectURL(url);
			resolve(Number.isFinite(audio.duration) ? Math.round(audio.duration) : 0);
		};
		audio.onerror = () => {
			URL.revokeObjectURL(url);
			resolve(0);
		};
		audio.src = url;
	});

const AddSongDialog = () => {
	const albums = useMusicStore((s) => s.albums);
	const fetchSongs = useMusicStore((s) => s.fetchSongs);
	const fetchAlbums = useMusicStore((s) => s.fetchAlbums);
	const fetchStats = useMusicStore((s) => s.fetchStats);

	const [open, setOpen] = useState(false);
	const [form, setForm] = useState(emptyForm);
	const [audio, setAudio] = useState<File | null>(null);
	const [image, setImage] = useState<File | null>(null);
	const [video, setVideo] = useState<File | null>(null);
	const [progress, setProgress] = useState<number | null>(null);

	const uploading = progress !== null;
	const canSubmit = !!audio && !!image && form.title.trim() && form.artist.trim() && form.duration > 0 && !uploading;

	const reset = () => {
		setForm(emptyForm);
		setAudio(null);
		setImage(null);
		setVideo(null);
	};

	const handleAudio = async (file: File | null) => {
		setAudio(file);
		if (!file) {
			setForm((f) => ({ ...f, duration: 0 }));
			return;
		}
		const duration = await readDuration(file);
		setForm((f) => ({
			...f,
			duration,
			// Prefill the title from the file name when it is still empty.
			title: f.title || file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim(),
		}));
		if (!duration) toast.error("Could not read the length of this audio file");
	};

	const handleSubmit = async () => {
		if (!canSubmit || !audio || !image) return;

		const formData = new FormData();
		formData.append("title", form.title.trim());
		formData.append("artist", form.artist.trim());
		formData.append("duration", String(form.duration));
		if (form.album !== NO_ALBUM) formData.append("albumId", form.album);
		formData.append("audioFile", audio);
		formData.append("imageFile", image);
		if (video) formData.append("videoFile", video);

		setProgress(0);
		try {
			await axiosInstance.post("/admin/songs", formData, {
				onUploadProgress: (event) => {
					if (event.total) setProgress(Math.round((event.loaded / event.total) * 100));
				},
			});
			toast.success(`"${form.title.trim()}" added`);
			reset();
			setOpen(false);
			fetchSongs();
			fetchAlbums();
			fetchStats();
			useMusicStore.setState({ albumCache: {} });
		} catch (error) {
			toast.error(getErrorMessage(error, "Could not add song"));
		} finally {
			setProgress(null);
		}
	};

	return (
		<Dialog open={open} onOpenChange={(next) => !uploading && setOpen(next)}>
			<DialogTrigger asChild>
				<Button className="rounded-full font-bold">
					<Plus className="size-4" />
					Add song
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Add a song</DialogTitle>
					<DialogDescription>Files are uploaded to Cloudinary. Each file can be up to 25 MB.</DialogDescription>
				</DialogHeader>

				<form
					id="add-song"
					className="space-y-4"
					onSubmit={(e) => {
						e.preventDefault();
						handleSubmit();
					}}
				>
					<FilePicker label="Audio" kind="audio" accept="audio/*" file={audio} onChange={handleAudio} hint="MP3, M4A, WAV or OGG" />
					<FilePicker label="Cover art" kind="image" accept="image/*" file={image} onChange={setImage} hint="Square, at least 640 x 640" />
					<FilePicker
						label="Canvas video"
						kind="video"
						accept="video/mp4,video/webm"
						file={video}
						onChange={setVideo}
						optional
						hint="Short muted loop shown behind the player"
					/>

					<div className="grid gap-4 sm:grid-cols-2">
						<label className="space-y-1.5 text-sm font-medium">
							Title
							<Input
								required
								maxLength={200}
								value={form.title}
								onChange={(e) => setForm({ ...form, title: e.target.value })}
								className="bg-surface-hover"
							/>
						</label>
						<label className="space-y-1.5 text-sm font-medium">
							Artist
							<Input
								required
								maxLength={200}
								value={form.artist}
								onChange={(e) => setForm({ ...form, artist: e.target.value })}
								className="bg-surface-hover"
							/>
						</label>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-1.5 text-sm font-medium">
							<span>Album</span>
							<Select value={form.album} onValueChange={(album) => setForm({ ...form, album })}>
								<SelectTrigger className="bg-surface-hover" aria-label="Album">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={NO_ALBUM}>No album (single)</SelectItem>
									{albums.map((album) => (
										<SelectItem key={album._id} value={album._id}>
											{album.title}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1.5 text-sm font-medium">
							<span>Duration</span>
							<p className="flex h-9 items-center rounded-md bg-surface-hover px-3 tabular-nums text-subdued">
								{form.duration ? formatTime(form.duration) : "Read from the audio file"}
							</p>
						</div>
					</div>
				</form>

				{uploading && (
					<div className="h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
						<div className="h-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
					</div>
				)}

				<DialogFooter className="gap-2">
					<Button variant="ghost" onClick={() => setOpen(false)} disabled={uploading}>
						Cancel
					</Button>
					<Button type="submit" form="add-song" disabled={!canSubmit} className="font-bold">
						{uploading ? (progress! < 100 ? `Uploading ${progress}%` : "Processing...") : "Add song"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AddSongDialog;
