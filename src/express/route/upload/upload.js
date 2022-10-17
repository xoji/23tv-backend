class Upload {
    async post(req, res, next) {
        try{
            const data = req.body
            res.status(200).json({data})
        } catch (e){
            next(e)
        }
    }
}

module.exports = new Upload()