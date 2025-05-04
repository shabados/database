export const DIST_PATH = './dist'
export const SLICES_PATH = `${DIST_PATH}/slices`

export const MASTER_DB = `${DIST_PATH}/master.sqlite`
export const BASE_DB = `${SLICES_PATH}/base.sqlite`

export const getAssetDatabasePath = (assetId: string) => `${SLICES_PATH}/asset-${assetId}.sqlite`
