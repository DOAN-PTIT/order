"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatNumber, getHostName } from "@/utils/tools";
import { Button, Divider, Image, Spin, Steps, Tag } from "antd";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { StepProps } from "antd";
import {
  CheckCircle,
  CheckFat,
  CreditCard,
  FileX,
  Hash,
  HourglassHigh,
  List,
  MapPinLine,
  Truck,
} from "@phosphor-icons/react";

const shop_id = localStorage.getItem("shop_id") || "";
const access_token = localStorage.getItem("access_token") || "";
const orderStatus = {
  1: {
    label: <div className="font-bold">Đang xử lý</div>,
    color: "blue",
    description: (
      <span className="font-medium text-sky-500">
        Đơn hàng đang chờ xác nhận từ shop
      </span>
    ),
    subTitle:
      "Trong giai đoạn này, shop sẽ kiểm tra và xác nhận các thông tin liên quan đến đơn hàng (ví dụ: sản phẩm có sẵn hay không, giá cả, v.v.).",
    icon: <HourglassHigh size={28} color="#0e83dd" weight="fill" />,
  },
  2: {
    label: <div className="font-bold">Đã xác nhận</div>,
    color: "yellow",
    description: (
      <span className="font-medium text-sky-500">
        Đơn hàng đã được shop xác nhận
      </span>
    ),
    subTitle:
      "Trạng thái này xác nhận rằng shop đã xác nhận đơn hàng và sẵn sàng giao hàng cho đơn vị vận chuyển.",
    icon: <CheckCircle size={28} color="#ddc10e" weight="fill" />,
  },
  3: {
    label: <div className="font-bold">Đang giao hàng</div>,
    color: "cyan",
    description: (
      <span className="font-medium text-sky-500">
        Đơn hàng đang trên đường được giao đến khách hàng
      </span>
    ),
    subTitle:
      "Trạng thái này xác nhận rằng đơn hàng đã được giao cho đơn vị vận chuyển và đang trên đường đến tay khách hàng.",
    icon: <Truck size={28} color="#300edd" weight="fill" />,
  },
  4: {
    label: <div className="font-bold">Đã giao hàng</div>,
    color: "green",
    description: (
      <span className="font-medium text-sky-500">
        Đơn hàng đã được giao thành công đến khách hàng
      </span>
    ),
    subTitle:
      "Trạng thái này xác nhận rằng quá trình giao hàng đã hoàn tất và khách hàng đã nhận được sản phẩm.",
    icon: <CheckFat size={28} color="#46f406" weight="fill" />,
  },
};

const OrderInfo = () => {
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingUpdateStatus, setLoadingUpdateStatus] = useState(false);

  const { order_id } = useParams<{ order_id: string }>();

  useEffect(() => {
    getOrderInfo();
  }, []);

  const stepProps: StepProps[] = Object.entries(orderStatus).map(
    ([key, value]) => {
      const status = () => {
        if (key == "-1") {
          if (orderInfo?.status == "-1") {
            return "error";
          } else {
            return "wait";
          }
        }

        if (key < orderInfo?.status) {
          return "finish";
        }

        if (key == orderInfo?.status) {
          return "process";
        }

        return "wait";
      };

      return {
        title: value.label,
        description: value.description,
        status: status(),
        icon: value.icon,
        subTitle: value.subTitle,
      };
    }
  );

  if (orderInfo?.status == "-1") {
    stepProps.push({
      title: <div className="font-bold">Hủy đơn hàng</div>,
      description: (
        <span className="font-medium text-red-500">Đơn hàng đã bị hủy</span>
      ),
      status: "error",
      icon: <FileX size={28} color="#f40606" weight="fill" />,
      subTitle:
        "Đơn hàng đã bị hủy. Mọi thông tin thắc mắc vui lòng liên hệ shop.",
    });
  }

  const getOrderInfo = async () => {
    setIsLoading(true);
    const url = `${getHostName()}/shop/${shop_id}/order/${order_id}`;
    return await axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then((res) => {
        setOrderInfo(res.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  };

  const handleUpdateStatus = async (status: string) => {
    setLoadingUpdateStatus(true);
    const url = `${getHostName()}/shop/${shop_id}/order/${order_id}`;
    return await axios
      .post(
        url,
        {
          status,
          is_update_status: true,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then((res) => {
        setLoadingUpdateStatus(false);
        getOrderInfo();
      })
      .catch((error) => {
        console.log(error);
        setLoadingUpdateStatus(false);
      });
  };

  const calculateTotalPriceProduct = (order: any = orderInfo) => {
    let totalPrice = 0;
    if (order?.orderitems) {
      order?.orderitems.forEach((item: any) => {
        const variation_info = item.variation_info || item.variation;
        totalPrice += item.quantity * variation_info?.retail_price;
      });
    }

    return formatNumber(totalPrice || 0);
  };

  const renderLoading = () => {
    return (
      <div className="h-screen bg-gray-300 flex text-black items-center justify-center w-full">
        Chờ chút xíu bạn nhé... <Spin />
      </div>
    );
  };

  return (
    <main className="bg-gray-300 h-screen overflow-scroll w-full text-black flex p-5 flex-col">
      {isLoading ? (
        renderLoading()
      ) : (
        <>
          <div className="text-center text-2xl font-[600]">
            Thông tin đơn hàng #{orderInfo?.id}
          </div>
          <Divider />
          <div className="flex gap-4">
            <div className="w-1/2">
              <div className="p-5 bg-white rounded-lg h-fit">
                <div className="flex justify-center items-center font-[600]">
                  <Hash size={28} color="#0692ea" weight="fill" />{" "}
                  <p className="ml-3">Trạng thái đơn hàng</p>
                </div>
                <Divider />
                <Steps
                  direction="vertical"
                  items={stepProps}
                  className="p-5"
                  current={orderInfo?.status}
                />
              </div>
              <div className="mt-4">
                <div className="p-5 bg-white rounded-lg h-fit">
                  <div className="flex justify-center items-center font-[600]">
                    <MapPinLine size={28} color="#0692ea" weight="fill" />{" "}
                    <p className="ml-3">Thông tin giao hàng</p>
                  </div>
                  <Divider />
                  <div className="flex justify-between flex-col gap-3">
                    <div className="flex justify-between">
                      <p>Khách hàng:</p> <p>{orderInfo?.customer.name}</p>
                    </div>
                    <div className="flex justify-between">
                      <p>Người nhận:</p> <p>{orderInfo?.recipient_name}</p>
                    </div>
                    <div className="flex justify-between">
                      <p>Số điện thoại người nhận:</p>{" "}
                      <p>{orderInfo?.recipient_phone_number}</p>
                    </div>
                    <div className="flex justify-between">
                      <p>Địa chỉ nhận hàng:</p>{" "}
                      <p>{orderInfo?.delivery_address}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="p-5 bg-white rounded-lg h-fit">
                  <div className="flex items-center justify-center font-[600]">
                    <CreditCard size={28} color="#0692ea" weight="fill" />{" "}
                    <p className="ml-3">Thông tin thanh toán</p>
                  </div>
                  <Divider />
                  <div className="flex justify-between items-center">
                    <p>Trạng thái:</p>{" "}
                    <p>
                      {[-1, 1].includes(orderInfo?.status) ? (
                        <span className="text-red-500">Chưa thanh toán</span>
                      ) : (
                        <span className="text-green-500">Đã thanh toán</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5 bg-white rounded-lg w-1/2 h-fit">
              <div className="flex items-center justify-center font-[600]">
                <List size={28} color="#0692ea" weight="fill" />{" "}
                <p className="ml-3">Thông tin chi tiết</p>
              </div>
              <Divider />
              <div>
                <div className="flex flex-col mb-5">
                  <h1 className="mb-4 font-[600]">Sản phẩm</h1>
                  <ul>
                    {orderInfo?.orderitems.map((item: any) => {
                      return (
                        <li key={item.id} className="flex gap-4 mb-4">
                          <Image
                            src={item.variation.image}
                            width={80}
                            height={80}
                            alt=""
                          />
                          <div className="flex flex-col w-full">
                            <p className="mb-2">
                              <Tag color="green">
                                {item.variation.variation_code}
                              </Tag>
                              <Tag color="red">
                                {item.variation.product.product_code}
                              </Tag>
                              <span>{item.variation.product.name}</span>
                            </p>
                            <div className="flex items-center justify-between w-full">
                              <p>Số lượng: {item.quantity}</p>
                              <p>x</p>
                              <p>{formatNumber(item.variation.retail_price)} đ</p>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="flex flex-col">
                  <h1 className="mb-4 font-[600]">Cần thanh toán</h1>
                  <ul className="flex flex-col gap-4 font-normal">
                    <li className="flex justify-between items-center">
                      <p>Giá sản phẩm: </p>{" "}
                      <p className="font-bold">
                        {calculateTotalPriceProduct()} đ
                      </p>
                    </li>
                    <li className="flex justify-between items-center">
                      <p>Giám giá: </p>{" "}
                      <p className="font-bold text-green-500">
                        {formatNumber(orderInfo?.total_discout)} đ
                      </p>
                    </li>
                    <li className="flex justify-between items-center">
                      <p>Phí vận chuyển: </p>{" "}
                      <p className="font-bold text-orange-500">
                        {formatNumber(orderInfo?.shipping_fee)} đ
                      </p>
                    </li>
                    <li className="flex justify-between items-center">
                      <p>Tổng cộng: </p>{" "}
                      <p className="font-bold text-red-500">
                        {formatNumber(orderInfo?.total_cost)} đ
                      </p>
                    </li>
                  </ul>
                  <div className="text-right mt-4">
                    <Button
                      danger
                      onClick={() => handleUpdateStatus("-1")}
                      disabled={orderInfo?.status == "-1"}
                      loading={loadingUpdateStatus}
                    >
                      Huỷ đơn
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
};

export default OrderInfo;
