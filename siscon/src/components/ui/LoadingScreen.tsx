export const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="relative flex h-16 w-16 items-center justify-center">
                    <div className="absolute h-full w-full animate-ping rounded-full bg-blue-400 opacity-20"></div>
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                </div>
                <div className="flex flex-col items-center">
                    <h2 className="text-xl font-bold text-slate-700">SisCon</h2>
                    <p className="text-sm text-slate-500 animate-pulse">Cargando sistema...</p>
                </div>
            </div>
        </div>
    );
};
