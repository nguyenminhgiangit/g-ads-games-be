
export async function getGameConfig(req: any, res: any) {
    try {
        // const gameId = req.params.id;
        // const result = await UserService.getPublicProfile(userId);
        res.json({});
    } catch (err: any) {
        res.status(404).json({ message: err.message });
    }
}