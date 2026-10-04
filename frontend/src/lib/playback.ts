import toast from "react-hot-toast";
import { axiosInstance, getErrorMessage } from "@/lib/axios";
import { useMusicStore } from "@/stores/useMusicStore";
import usePlayerStore from "@/stores/usePlayerStore";
import type { Album } from "@/types";

// Plays an album from its first track, or toggles playback if it is already loaded.
export const playOrToggleAlbum = async (albumId: string) => {
	const player = usePlayerStore.getState();
	if (player.currentSong?.albumId === albumId) {
		player.togglePlay();
		return;
	}

	try {
		const cached = useMusicStore.getState().albumCache[albumId];
		const album = cached ?? (await axiosInstance.get<Album>(`/albums/${albumId}`)).data;
		if (album.songs.length === 0) {
			toast.error("This album has no songs yet");
			return;
		}
		player.playQueue(album.songs, 0);
	} catch (error) {
		toast.error(getErrorMessage(error, "Could not play album"));
	}
};
