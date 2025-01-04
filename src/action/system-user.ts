import { getHostName } from "@/utils/tools"
import axios from "axios"

export const systemUser = async (fb_shop_id: string) => {
    const url = `${getHostName()}/auth/system-user/${fb_shop_id}`
    return await axios.post(url).then((res) => {
        const accessToken = res.data.accessToken
        localStorage.setItem("access_token", accessToken)
        localStorage.setItem("shop_id", res.data.shop_id)
        return res.data
    }).catch((error) => {
        console.log(error);
    })
}