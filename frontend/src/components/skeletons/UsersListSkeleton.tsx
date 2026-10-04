const UsersListSkeleton = () => (
	<div className="space-y-1" aria-hidden="true">
		{Array.from({ length: 5 }).map((_, i) => (
			<div key={i} className="flex items-center gap-3 p-2">
				<div className="size-11 animate-pulse rounded-full bg-surface-hover" />
				<div className="flex-1 space-y-2">
					<div className="h-3.5 w-24 animate-pulse rounded bg-surface-hover" />
					<div className="h-3 w-32 animate-pulse rounded bg-surface-hover" />
				</div>
			</div>
		))}
	</div>
);

export default UsersListSkeleton;
