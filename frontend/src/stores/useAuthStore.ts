import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";

interface AuthStore {
	isAdmin: boolean;
	adminChecked: boolean;

	checkAdminStatus: () => Promise<void>;
	reset: () => void;
}

const useAuthStore = create<AuthStore>((set) => ({
	isAdmin: false,
	adminChecked: false,

	checkAdminStatus: async () => {
		try {
			const response = await axiosInstance.get<{ admin: boolean }>("/admin/check");
			set({ isAdmin: response.data.admin });
		} catch {
			// 401/403 simply mean the current visitor is not an admin.
			set({ isAdmin: false });
		} finally {
			set({ adminChecked: true });
		}
	},

	reset: () => set({ isAdmin: false, adminChecked: true }),
}));

export default useAuthStore;
