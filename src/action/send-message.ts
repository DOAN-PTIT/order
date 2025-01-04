import axios from "axios";

export const sendMessageOrderSuccess = async (
  order: any,
  shop_fb_id: string,
  sender_psid: string
) => {
  const url = "http://localhost:5000/order";
  const message = `Đơn hàng ${order.id} đã được xác nhận thành công!. Vui lòng kiểm tra thông tin đơn hàng tại đây: http://localhost:3888/shop/${shop_fb_id}/order/${order.id}`;

  return await axios
    .post(url, { message, sender_psid })
    .then((res) => {
      console.log(res.data);
    })
    .catch((err) => {
      console.log(err);
    });
};
