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
import { axiosInstance, getErrorMessage } from "@/lib/axios";
import { useMusicStore } from "@/stores/useMusicStore";
import FilePicker from "./FilePicker";

const currentYear = new Date().getFullYear();
const emptyForm = { title: "", artist: "", genre: "", releaseYear: String(currentYear) };

const AddAlbumDialog = () => {
	const fetchAlbums = useMusicStore((s) => s.fetchAlbums);
	const fetchStats = useMusicStore((s) => s.fetchStats);
	const albums = useMusicStore((s) => s.albums);
	const genres = [...new Set(albums.map((album) => album.genre).filter((genre): genre is string => !!genre))].sort();
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState(emptyForm);
	const [image, setImage] = useState<File | null>(null);
	const [saving, setSaving] = useState(false);

	const year = Number(form.releaseYear);
	const yearValid = Number.isInteger(year) && year >= 1900 && year <= currentYear + 1;
	const canSubmit = !!image && form.title.trim() && form.artist.trim() && yearValid && !saving;

	const handleSubmit = async () => {
		if (!canSubmit || !image) return;

		const formData = new FormData();
		formData.append("title", form.title.trim());
		formData.append("artist", form.artist.trim());
		formData.append("releaseYear", String(year));
		if (form.genre.trim()) formData.append("genre", form.genre.trim());
		formData.append("imageFile", image);

		setSaving(true);
		try {
			await axiosInstance.post("/admin/albums", formData);
			toast.success(`"${form.title.trim()}" created`);
			setForm(emptyForm);
			setImage(null);
			setOpen(false);
			fetchAlbums();
			fetchStats();
		} catch (error) {
			toast.error(getErrorMessage(error, "Could not create album"));
		} finally {
			setSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={(next) => !saving && setOpen(next)}>
			<DialogTrigger asChild>
				<Button className="rounded-full font-bold">
					<Plus className="size-4" />
					Add album
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Create an album</DialogTitle>
					<DialogDescription>Songs can be added to the album after it is created.</DialogDescription>
				</DialogHeader>

				<form
					id="add-album"
					className="space-y-4"
					onSubmit={(e) => {
						e.preventDefault();
						handleSubmit();
					}}
				>
					<FilePicker label="Cover art" kind="image" accept="image/*" file={image} onChange={setImage} hint="Square, at least 640 x 640" />
					<label className="block space-y-1.5 text-sm font-medium">
						Title
						<Input
							required
							maxLength={200}
							value={form.title}
							onChange={(e) => setForm({ ...form, title: e.target.value })}
							className="bg-surface-hover"
						/>
					</label>
					<label className="block space-y-1.5 text-sm font-medium">
						Genre <span className="font-normal text-subdued">(optional)</span>
						<Input
							maxLength={60}
							value={form.genre}
							onChange={(e) => setForm({ ...form, genre: e.target.value })}
							placeholder="For example Electronic, Jazz or Lo-fi"
							className="bg-surface-hover"
							list="genre-options"
						/>
						<datalist id="genre-options">
							{genres.map((genre) => (
								<option key={genre} value={genre} />
							))}
						</datalist>
					</label>
					<div className="grid gap-4 sm:grid-cols-2">
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
						<label className="space-y-1.5 text-sm font-medium">
							Release year
							<Input
								type="number"
								required
								min={1900}
								max={currentYear + 1}
								value={form.releaseYear}
								onChange={(e) => setForm({ ...form, releaseYear: e.target.value })}
								className="bg-surface-hover"
								aria-invalid={!yearValid}
							/>
						</label>
					</div>
				</form>

				<DialogFooter className="gap-2">
					<Button variant="ghost" onClick={() => setOpen(false)} disabled={saving}>
						Cancel
					</Button>
					<Button type="submit" form="add-album" disabled={!canSubmit} className="font-bold">
						{saving ? "Creating..." : "Create album"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AddAlbumDialog;
