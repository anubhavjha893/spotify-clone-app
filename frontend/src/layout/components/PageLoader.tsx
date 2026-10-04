const PageLoader = () => (
	<div className="grid h-full place-items-center" role="status" aria-label="Loading">
		<span className="size-8 animate-spin rounded-full border-2 border-white/15 border-t-primary" />
	</div>
);

export default PageLoader;
