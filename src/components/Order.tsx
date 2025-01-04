/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Button,
  Divider,
  Empty,
  Form,
  Image,
  Input,
  InputNumber,
  Tag,
} from "antd";
import { useEffect, useState } from "react";
import ProductSearchBar from "./ProductSearchBar";
import { formatNumber, getHostName } from "@/utils/tools";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { systemUser } from "@/action/system-user";
import CustomDatePicker from "./CustomDatePicker";
import moment from "moment";
import axios from "axios";
import { cloneDeep } from "lodash";
import { sendMessageOrderSuccess } from "@/action/send-message";
import {
  CreditCard,
  IdentificationBadge,
  ListBullets,
  MapPinLine,
} from "@phosphor-icons/react";

const defaultOrderParams = {
  note: "Đơn từ Facebook Shop, được tạo tự động bở Hệ Thống",
  delivery_address: "",
  delivery_company: "",
  delivery_cost: 0,
  delivery_cost_shop: 0,
  estimated_delivery: moment().format("YYYY-MM-DD"),
  tracking_number: "",
  paid: 0,
  total_cost: 0,
  recipient_name: "",
  recipient_phone_number: "",
  createdAt: moment().format("YYYY-MM-DD HH:mm"),
  products_order: [],
  shopuser_id: 0,
  add_customer: {
    email: "",
    phone_number: "",
    name: "",
  },
  surcharge: 0,
  at_counter: false,
  promotion_id: null,
  total_discount: 0,
};
const shop_id = localStorage.getItem("shop_id") || "";

function Order() {
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [searchProductResult, setSearchProductResult] = useState<any[]>([]);
  const [order, setOrder] = useState(defaultOrderParams);
  const [isLoading, setIsLoading] = useState(false);

  const { id } = useParams();
  const searchParams = useSearchParams();
  const sender_psid =
    Object.fromEntries(searchParams.entries()).sender_psid || "";
  if (sender_psid) {
    localStorage.setItem("sender_psid", sender_psid);
  }
  const router = useRouter();

  useEffect(() => {
    if (id) {
      systemUser(id as string).then((res) => {
        if (res) {
          setOrder((prev: any) => {
            return {
              ...prev,
              shopuser_id: res.shopuser_id,
            };
          });
        }
      });
    }
  }, [id]);

  useEffect(() => {
    setOrder((prev: any) => {
      return {
        ...prev,
        products_order: selectedProducts.map((item) => ({
          variation_id: item.id,
          quantity: item.number,
          product_id: item.product.id,
        })),
      };
    });
  }, [selectedProducts]);

  const onChangeInputQuantity = (value: any, variation_id: any) => {
    const newSelectedProducts = selectedProducts.map((item) => {
      if (item.id == variation_id) {
        item.number = value;
      }
      return item;
    });
    setSelectedProducts(newSelectedProducts);
  };

  const onChangeInput = (value: string, key: string) => {
    if (["phone_number", "name", "email", "address"].includes(key)) {
      setOrder((prev: any) => {
        return {
          ...prev,
          add_customer: {
            ...prev.add_customer,
            [key]: value,
          },
        };
      });
    } else {
      setOrder((prev: any) => {
        return {
          ...prev,
          [key]: value,
        };
      });
    }
  };

  const handleSelectProduct = (variation_id: any) => {
    const variation = selectedProducts.find((item) => item.id == variation_id);
    const index = searchProductResult.findIndex(
      (item) => item.id == variation_id
    );
    if (!variation) {
      const data = {
        number: 1,
        ...searchProductResult[index],
      };
      setSelectedProducts([...selectedProducts, data]);
    } else {
      const newSelectedProducts = selectedProducts.map((item) => {
        if (item.id == variation_id) {
          item.number++;
        }
        return item;
      });
      setSelectedProducts(newSelectedProducts);
    }
  };

  const handleDeleteProduct = (variation_id: any) => {
    const newSelectedProducts = selectedProducts.filter(
      (item) => item.id != variation_id
    );
    setSelectedProducts(newSelectedProducts);
  };

  const calcTotalPrice = () => {
    let total = 0;
    total = selectedProducts.reduce((acc, cur) => {
      return acc + cur.retail_price * cur.number;
    }, 0);

    return total;
  };

  const calcTotalDiscount = () => {
    let totalDiscount = 0;
    totalDiscount = selectedProducts.reduce((acc, variation) => {
      const promotion = variation.promotion_item;
      if (promotion) {
        const isDiscountPercent = promotion?.is_discount_percent || false;
        const maxDiscount = promotion.max_discount;
        const discountByPercent = Math.min(
          variation.retail_price * (promotion.discount / 100) || 0,
          maxDiscount || 0
        );

        const discount = isDiscountPercent
          ? discountByPercent * variation.number
          : promotion.discount * variation.number;
        return acc + discount;
      }

      return acc;
    }, 0);

    return totalDiscount;
  };

  const handleCreateOrder = async () => {
    setIsLoading(true);
    const cloneOrder = cloneDeep(order);
    cloneOrder.total_cost = calcTotalPrice() - calcTotalDiscount();
    const url = `${getHostName()}/shop/${shop_id}/order/create`;
    return await axios
      .post(url, cloneOrder, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      .then((res) => {
        console.log(res);
        const order = res.data;
        sendMessageOrderSuccess(order, shop_id, sender_psid);
        setIsLoading(false);
        router.push(`${id}/order/${order.id}`);
      })
      .catch((err) => {
        setIsLoading(false);
        console.log(err);
      });
  };

  const renderCheckoutInfo = () => {
    return (
      <div className="bg-gray-200 flex gap-4 flex-col p-4 rounded-lg">
        <div className="flex justify-between">
          <p>Tổng cộng</p>
          <p className="font-bold">{formatNumber(calcTotalPrice())} đ</p>
        </div>
        <div className="flex justify-between">
          <p>Giảm giá</p>
          <p className="font-bold text-green-500">
            {formatNumber(calcTotalDiscount())} đ
          </p>
        </div>
        <div className="flex justify-between">
          <p>Phí vận chuyển</p>
          <p className="font-bold text-orange-500">0 đ</p>
        </div>
        <Divider />
        <div className="flex justify-between">
          <p>Tổng tiền</p>
          <p className="font-bold">
            {formatNumber(calcTotalPrice() - calcTotalDiscount())} đ
          </p>
        </div>
      </div>
    );
  };

  const renderSelectedProduct = () => {
    return (
      <div className="bg-gray-200 flex gap-4 flex-col p-4 rounded-lg">
        {selectedProducts.map((variation, index) => {
          return (
            <div key={index} className="flex p-4 rounded-lg bg-white">
              <div className="w-[15%]">
                <Image
                  src={variation.image}
                  alt={variation.product?.name}
                  width={50}
                />
              </div>
              <div className="flex flex-col gap-4 w-[85%]">
                <div className="flex justify-between w-full">
                  <div className="flex justify-between">
                    <p>
                      <Tag color="green">{variation.variation_code}</Tag>
                    </p>
                    <p>
                      <Tag color="red">{variation.product?.product_code}</Tag>
                    </p>
                    <p>{variation.product?.name}</p>
                  </div>
                  <Button
                    danger
                    className="py-1 px-2"
                    onClick={() => handleDeleteProduct(variation.id)}
                  >
                    X
                  </Button>
                </div>
                <div className="flex justify-between">
                  <p>{formatNumber(variation?.retail_price)} đ</p>
                  <p>x</p>
                  <InputNumber
                    value={variation.number}
                    formatter={(value) => formatNumber(value)}
                    parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
                    onChange={(value) =>
                      onChangeInputQuantity(value, variation.id)
                    }
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-screen overflow-scroll w-full flex flex-col items-center p-5 bg-gray-300 text-black">
      <div className="p-4 text-3xl font-[400]">Xác nhận đơn hàng</div>
      <Divider />
      <div className="flex justify-between gap-5 w-full">
        <div className="flex items-center flex-col gap-4 w-1/2">
          <div className="bg-white py-5 px-8 rounded-lg w-[95%]">
            <div className="font-bold flex items-center">
              <ListBullets size={28} color="#0692ea" weight="fill" />{" "}
              <p className="ml-3">Đơn hàng: {selectedProducts.length} sản phẩm</p>
            </div>
            <Divider />
            <div>
              <div className="flex gap-3 items-center mb-5 justify-between">
                <p className="mr-10">Chọn sản phẩm: </p>
                <ProductSearchBar
                  handleSelectProduct={handleSelectProduct}
                  setSearchProductResult={setSearchProductResult}
                />
              </div>
              <div>
                {selectedProducts.length == 0 ? (
                  <div className="bg-gray-200 p-4 rounded-lg">
                    <Empty description="Chưa chọn sản phẩm nào" />
                  </div>
                ) : (
                  renderSelectedProduct()
                )}
              </div>
            </div>
          </div>
          <div className="bg-white py-5 px-8 rounded-lg w-[95%]">
            <div className="font-bold flex items-center">
              <IdentificationBadge size={28} color="#0692ea" weight="fill" />
              <p className="ml-3">Thông tin cá nhân</p>
            </div>
            <Divider />
            <Form labelAlign="left" labelCol={{ span: 5 }}>
              <Form.Item
                label="Email"
                rules={[
                  {
                    required: true,
                    message: "Họ và tên không được để trống",
                  },
                ]}
                name="email"
              >
                <Input
                  variant="filled"
                  placeholder="Email"
                  onChange={(e) => onChangeInput(e.target.value, "email")}
                />
              </Form.Item>
              <Form.Item
                label="Họ và tên"
                rules={[
                  {
                    required: true,
                    message: "Họ và tên không được để trống",
                  },
                ]}
                name="full_name"
              >
                <Input
                  placeholder="Họ và tên"
                  variant="filled"
                  onChange={(e) => onChangeInput(e.target.value, "name")}
                />
              </Form.Item>
              <Form.Item
                label="Số điện thoại"
                rules={[
                  {
                    required: true,
                    message: "Số điện thoại không được để trống",
                  },
                ]}
                name={"phone_number"}
              >
                <Input
                  placeholder="Số điện thoại"
                  variant="filled"
                  onChange={(e) =>
                    onChangeInput(e.target.value, "phone_number")
                  }
                />
              </Form.Item>
            </Form>
          </div>
          <div className="bg-white w-[95%] p-4 rounded-lg mb-4">
            <div className="flex items-center font-[600]">
              <MapPinLine size={28} color="#0692ea" weight="fill" />{" "}
              <p className="ml-3">Thông tin nhận hàng</p>
            </div>
            <Divider />
            <Form labelAlign="left" labelCol={{ span: 8 }}>
              <Form.Item label="Tên người nhận" required name="recipient_name">
                <Input
                  variant="filled"
                  onChange={(e) =>
                    onChangeInput(e.target.value, "recipient_name")
                  }
                  placeholder="Tên người nhận"
                />
              </Form.Item>
              <Form.Item
                label="Số điện thoại người nhận"
                required
                name="recipient_phone_number"
              >
                <Input
                  variant="filled"
                  placeholder="Số điện thoại người nhận"
                  onChange={(e) =>
                    onChangeInput(e.target.value, "recipient_phone_number")
                  }
                />
              </Form.Item>
              <Form.Item
                label="Địa chỉ nhận hàng"
                required
                name="delivery_address"
              >
                <Input
                  variant="filled"
                  placeholder="Địa chỉ nhận hàng"
                  onChange={(e) =>
                    onChangeInput(e.target.value, "delivery_address")
                  }
                />
              </Form.Item>
              <Form.Item
                label="Ngày nhận hàng mong muốn"
                required
                name={"estimated_delivery"}
                className="text-right"
              >
                <CustomDatePicker
                  onChange={(value, dateString) =>
                    onChangeInput(dateString as string, "estimated_delivery")
                  }
                  variant="filled"
                  format="YYYY-MM-DD"
                  value={order.estimated_delivery}
                  className="w-2/3"
                  placeholder="Ngày nhận hàng mong muốn"
                />
              </Form.Item>
            </Form>
          </div>
        </div>

        {/* Right side */}

        <div className="w-1/2">
          <div className="bg-white p-4 rounded-lg">
            <div className="font-bold mb-4 flex">
              <CreditCard size={28} color="#0692ea" weight="fill" />
              <p className="ml-3">Chi tiết thanh toán</p>
            </div>
            {renderCheckoutInfo()}
            <div className="text-right mt-4">
              <Button
                htmlType="submit"
                type="primary"
                onClick={handleCreateOrder}
                loading={isLoading}
              >
                Đặt hàng
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Order;
