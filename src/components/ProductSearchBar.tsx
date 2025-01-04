/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatNumber, getHostName } from "@/utils/tools";
import { Image, Select, Spin, Tag } from "antd";
import axios from "axios";
import { Dispatch, SetStateAction, useState } from "react";
import { debounce } from "lodash";

interface ProductSearchBarProps {
    handleSelectProduct: (product: any) => void;
    setSearchProductResult: Dispatch<SetStateAction<any[]>>;
}

const ProductSearchBar = (props: ProductSearchBarProps) => {
    const { handleSelectProduct, setSearchProductResult } = props;
  const [searchVariation, setSearchVariation] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (value: string) => {
    if (!value) return;

    const shop_id = parseInt(localStorage.getItem("shop_id") || "0");
    const access_token = localStorage.getItem("access_token") || "";
    const url = `${getHostName()}/shop/${shop_id}/variation/${value}`;

    setIsLoading(true);
    return await axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then((res) => {
        setIsLoading(false);
        setSearchProductResult(res.data || []);
        setSearchVariation(res.data);
      })
      .catch((error) => {
        setIsLoading(false);
        console.log(error);
      });
  };

  const deboundSearch = debounce(handleSearch, 500);

  return (
    <div>
      <Select
        placeholder="Tìm sản phẩm theo tên sản phẩm, mã sản phẩm, mã mẫu mã"
        showSearch
        variant="filled"
        filterOption={false}
        onSearch={deboundSearch}
        notFoundContent={
          isLoading ? (
            <div className="text-center">
              Chờ chút xíu bạn nhé.... <Spin />
            </div>
          ) : (
            <div className="h-14 flex items-center justify-center">
              Không tìm thấy sản phẩm!!
            </div>
          )
        }
        onSelect={handleSelectProduct}
        value={null}
      >
        {searchVariation.map((variation: any) => (
          <Select.Option key={variation.id} >
            <div className="flex gap-2 w-full justify-between">
              <div className="w-1/5">
                <Image preview={false} width={80} height={80} alt="" src={variation.image || "https://res.cloudinary.com/dzu5qbyzq/image/upload/v1732203781/product_avatar_default.webp?fbclid=IwY2xjawGsjapleHRuA2FlbQIxMAABHf18-FMV5iWxBn5H4jGAUiRGvOAp6fOLYfNBFwGzJr3_hQfp7Kbutp1JbQ_aem_Kqm41MSZ_WUiveMINit8Iw"} />
              </div>
              <div className="w-4/5 flex justify-between">
                <div className="flex flex-col gap-1 w-2/3">
                  <p className="font-bold">{variation.product.name}</p>
                  <p>
                    <Tag color="green">
                      <span>{variation.product.product_code}</span>
                    </Tag>
                    <Tag color="red">
                      <span>{variation.variation_code}</span>
                    </Tag>
                  </p>
                </div>
                <div className="text-green-500 font-bold w-1/3 text-end">
                  {formatNumber(variation.retail_price, "VND")} ₫
                </div>
              </div>
            </div>
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default ProductSearchBar;
