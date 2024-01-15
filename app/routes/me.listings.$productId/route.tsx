import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  ActionFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { Fragment, useEffect, useState } from "react";
import { Link, useLoaderData } from "@remix-run/react";
import { Listbox, Transition, Switch } from "@headlessui/react";
import {
  PhotoIcon,
  UserCircleIcon,
  ChevronUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";

import AuthService from "../../services/Auth.service";
import getEnv from "get-env";
import fetcher from "../../utils/fetcher";

import Toast from "~/components/Toast";
import SelectBox from "~/components/SelectBox";
import InputText from "~/components/InputText";
import TextArea from "~/components/TextArea";

const people = [
  { id: 1, name: "Moda" },
  { id: 2, name: "Tecnología" },
  { id: 3, name: "Deportes" },
  { id: 4, name: "Automotriz" },
  { id: 5, name: "Hogar" },
  { id: 6, name: "Diseño" },
  { id: 7, name: "Salud & Belleza" },
  { id: 8, name: "Educación" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// LOADER FUNCTION
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  // Attempt to get the user from the session
  const user = await AuthService.getCurrentUser({ request }).catch((err) => {
    console.log(err);
    return null;
  });

  // Get the shop data
  const productDetails = await fetcher(
    `${getEnv().API_URL}/admin/myproducts/${params.productId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    }
  ).catch((err) => {
    throw new Error("Error fetching product data");
  });

  // Get categories
  const categories = await fetcher(`${getEnv().API_URL}/admin/categories`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
    },
  }).catch((err) => {
    throw new Error("Error fetching categories");
  });

  // Get subcategories
  let subcategories = [];
  if(productDetails.categories.length > 0){
    subcategories = await getSubcategories(productDetails.categories[0].id, user)
      .catch((err) => {
        console.log(err);
        throw new Error("Error fetching subcategories");
      });
  }
  subcategories = subcategories.length 
    ? subcategories 
    : [{ id: 0, name: "Sin subcategorías" }];
  

  console.log('ASDASDASDASDADASDASDASDADASDAD ', subcategories)




  // Return response
  return json({
    currentUser: user,
    productDetails,
    categories,
    subcategories,
  });
};


const getSubcategories = async(categoryId: number, user: object): Promise<any> => {
  // Get subcategories
  const subcategories = await fetcher(
    `${getEnv().API_URL}/admin/getSubcategories`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        categories: [categoryId]
      })
    }
  ).catch((err) => {
    throw new Error("Error fetching subcategories");
  });

  return subcategories;
}

export default function ProductDetails() {
  const { currentUser, productDetails, categories, subcategories } = useLoaderData<typeof loader>();

  // Categories configuration
  const [selectedCategory, setSelectedCategory] = useState((()=>{
    const category = categories.find((cat) => {
      return productDetails.categories.find(prodCat => prodCat.id === cat.id)
    });
    return category || null;
  })());
  const [subcategoryList, setSubcategoryList] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(subcategoryList?.[0] || null);
  useEffect(() => {
    if(selectedCategory){
      console.log('updated category ', selectedCategory);
      getSubcategories(selectedCategory.id, currentUser)
        .then((res) => {
          const subcategories = res.length 
            ? res 
            : [{ id: null, name: "Sin subcategorías" }];
          setSubcategoryList(subcategories);
          setSelectedSubcategory(!res.length ? subcategories[0] : null);
        }
      ).catch((err) => {
        console.log(err);
      });
    }
    // setSelectedCategory(categories[0]);
    // Get related subcategories
    
  }, [selectedCategory]);

  //
  const [selected, setSelected] = useState(people[3]);
  const [enabled, setEnabled] = useState(productDetails.status === "activo");

  // Return JSX
  return (
    <>
      {/* HEADER */}
      <div className="bg-white -mx-8 -mt-10 p-5 sticky mb-8 z-20">
        <div>
          <nav className="sm:hidden" aria-label="Back">
            <a
              href="#"
              className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ChevronLeftIcon
                className="-ml-1 mr-1 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              Back
            </a>
          </nav>
          <nav className="hidden sm:flex" aria-label="Breadcrumb">
            <ol role="list" className="flex items-center space-x-4">
              <li>
                <div className="flex">
                  <Link
                    to="/me/listings"
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Productos
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRightIcon
                    className="h-5 w-5 flex-shrink-0 text-gray-400"
                    aria-hidden="true"
                  />
                  <Link
                    to="#"
                    className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    {productDetails.name}
                  </Link>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <div className="mt-2 md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              {productDetails.name}
            </h2>
          </div>
          <div className="mt-4 flex flex-shrink-0 md:ml-4 md:mt-0">
            <Switch.Group
              as="div"
              className="flex items-center justify-between"
            >
              <span className="flex flex-grow flex-col">
                <Switch.Label
                  as="div"
                  className="text-sm font-medium leading-6 text-gray-900"
                  passive
                >
                  Publicar
                </Switch.Label>
              </span>
              <Switch
                checked={enabled}
                onChange={setEnabled}
                className={classNames(
                  enabled ? "bg-indigo-600" : "bg-gray-200",
                  " self-end relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                )}
              >
                <span className="sr-only">Use setting</span>
                <span
                  className={classNames(
                    enabled ? "translate-x-5" : "translate-x-0",
                    "pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  )}
                >
                  <span
                    className={classNames(
                      enabled
                        ? "opacity-0 duration-100 ease-out"
                        : "opacity-100 duration-200 ease-in",
                      "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity"
                    )}
                    aria-hidden="true"
                  >
                    <svg
                      className="h-3 w-3 text-gray-400"
                      fill="none"
                      viewBox="0 0 12 12"
                    >
                      <path
                        d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span
                    className={classNames(
                      enabled
                        ? "opacity-100 duration-200 ease-in"
                        : "opacity-0 duration-100 ease-out",
                      "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity"
                    )}
                    aria-hidden="true"
                  >
                    <svg
                      className="h-3 w-3 text-indigo-600"
                      fill="currentColor"
                      viewBox="0 0 12 12"
                    >
                      <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                    </svg>
                  </span>
                </span>
              </Switch>
            </Switch.Group>

            <button
              type="button"
              className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
      {/* END: HEADER */}

      <div className="space-y-10 divide-y divide-gray-900/10">
        {/* GENERAL INFORMATION */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Información General
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              This information will be displayed publicly so be careful what you
              share.
            </p>
          </div>

          <form className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <div className="px-4 py-6 sm:p-8">
              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                {/* NAME */}
                <div className="sm:col-span-4">
                  <InputText 
                    id="name"
                    name="name"
                    type="text"
                    label="Nombre"
                    autoComplete="name"
                    defaultValue={productDetails.name}
                    // errors={formErrors?.clabe}
                  />
                  
                  {/*
                  <div className="mt-2">
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                      <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                        http://
                      </span>
                      <input
                        type="text"
                        name="website"
                        id="website"
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder="www.example.com"
                      />
                    </div>
                  </div> */}
                </div>

                {/* SKU */}
                <div className="sm:col-span-4">
                  <InputText 
                    id="sku"
                    name="sku"
                    type="text"
                    label="Sku"
                    autoComplete="sku"
                    defaultValue={productDetails.sku}
                    placeholder="Identificador único"
                    // errors={formErrors?.clabe}
                  />
                </div>

                {/* SHORT DESCRIPTION */}
                <div className="col-span-full">
                  <TextArea 
                    id="short_description"
                    name="short_description"
                    type="text"
                    label="Resumen de tu producto"
                    autoComplete="short_description"
                    defaultValue={productDetails.short_description}
                    rows={5}
                    helperText="Write a few sentences about your product."
                    // placeholder="Identificador único"
                    // errors={formErrors?.short_description}
                  />
                </div>

                {/* LONG DESCRIPTION */}
                <div className="col-span-full">
                  <TextArea 
                    id="description"
                    name="description"
                    type="text"
                    label="Descripción detallada"
                    autoComplete="description"
                    defaultValue={productDetails.description}
                    rows={15}
                    helperText="Write a few sentences about your product."
                    // placeholder="Identificador único"
                    // errors={formErrors?.description}
                  />
                </div>

                {/* CATEGORÍA */}
                <div className="col-span-full">
                  <SelectBox
                    label="Categoría"
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    optionsList={categories}
                  />
                  <input
                    type="hidden"
                    name="category"
                    // value={productDetails?.category || ""}
                  />
                </div>

                <div className="col-span-full">
                  <SelectBox
                    label="Subcategoría"
                    value={selectedSubcategory}
                    excludeDefaultOption
                    optionsList={
                      subcategoryList
                    }
                    disabled={subcategoryList.length < 2}
                  />
                  <input
                    type="hidden"
                    name="subcategory"
                    // value={productDetails?.category || ""}
                  />
                </div>

                <div className="col-span-full">
                  <label
                    htmlFor="website"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Keywords
                  </label>
                  <div className="mt-2">
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                      <input
                        type="text"
                        name="website"
                        id="website"
                        className="block flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder="Palabras separadas por comas"
                      />
                    </div>

                    <div>
                      <div className="bg-indigo-100 inline-flex items-center text-sm rounded mt-2 mr-1">
                        <span
                          className="ml-2 mr-1 leading-relaxed truncate max-w-xs"
                          x-text="tag"
                        >
                          Educación
                        </span>
                        <button className="w-6 h-8 inline-block align-middle text-gray-500 hover:text-gray-600 focus:outline-none">
                          <svg
                            className="w-6 h-6 fill-current mx-auto"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M15.78 14.36a1 1 0 0 1-1.42 1.42l-2.82-2.83-2.83 2.83a1 1 0 1 1-1.42-1.42l2.83-2.82L7.3 8.7a1 1 0 0 1 1.42-1.42l2.83 2.83 2.82-2.83a1 1 0 0 1 1.42 1.42l-2.83 2.83 2.83 2.82z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    Write a few sentences about your product.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
        {/* END: GENERAL INFORMATION */}

        {/* GALLERY */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Personal Information
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Use a permanent address where you can receive mail.
            </p>
          </div>

          <form className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <div className="px-4 py-6 sm:p-8">
              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="col-span-full">
                  <label
                    htmlFor="cover-photo"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Galería
                  </label>
                  <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                    <div className="text-center">
                      <PhotoIcon
                        className="mx-auto h-12 w-12 text-gray-300"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-span-full">
                  <ul
                    role="list"
                    className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8"
                  >
                    <li className="relative">
                      <div className="group relative">
                        <button className="group absolute z-10 right-0 bg-gray-200 bg-opacity-80 ml-2 h-7 w-7 items-center justify-center sm:flex">
                          <svg
                            className="h-8 w-8 stroke-slate-400 transition group-hover:stroke-slate-600"
                            fill="none"
                            viewBox="0 0 32 32"
                            xmlns="http://www.w3.org/2000/svg"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path
                              d="M12.9975 10.7499L11.7475 10.7499C10.6429 10.7499 9.74747 11.6453 9.74747 12.7499L9.74747 21.2499C9.74747 22.3544 10.6429 23.2499 11.7475 23.2499L20.2475 23.2499C21.352 23.2499 22.2475 22.3544 22.2475 21.2499L22.2475 12.7499C22.2475 11.6453 21.352 10.7499 20.2475 10.7499L18.9975 10.7499"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></path>
                            <path
                              d="M17.9975 12.2499L13.9975 12.2499C13.4452 12.2499 12.9975 11.8022 12.9975 11.2499L12.9975 9.74988C12.9975 9.19759 13.4452 8.74988 13.9975 8.74988L17.9975 8.74988C18.5498 8.74988 18.9975 9.19759 18.9975 9.74988L18.9975 11.2499C18.9975 11.8022 18.5498 12.2499 17.9975 12.2499Z"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></path>
                            <path
                              d="M13.7475 16.2499L18.2475 16.2499"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></path>
                            <path
                              d="M13.7475 19.2499L18.2475 19.2499"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></path>
                            <g className="opacity-0">
                              <path
                                d="M15.9975 5.99988L15.9975 3.99988"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              ></path>
                              <path
                                d="M19.9975 5.99988L20.9975 4.99988"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              ></path>
                              <path
                                d="M11.9975 5.99988L10.9975 4.99988"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              ></path>
                            </g>
                          </svg>
                        </button>
                        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200">
                          <img
                            src="https://tailwindui.com/img/ecommerce-images/home-page-02-product-01.jpg"
                            alt="Black machined steel pen with hexagonal grip and small white logo at top."
                            className="h-full w-full object-cover object-center group-hover:opacity-75"
                          />
                        </div>
                      </div>
                    </li>
                    <li className="relative">
                      <div className="group relative">
                        <button className="group absolute z-10 right-0 bg-gray-200 bg-opacity-80 ml-2 h-7 w-7 items-center justify-center sm:flex">
                          <svg
                            className="h-8 w-8 stroke-slate-400 transition group-hover:stroke-slate-600"
                            fill="none"
                            viewBox="0 0 32 32"
                            xmlns="http://www.w3.org/2000/svg"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path
                              d="M12.9975 10.7499L11.7475 10.7499C10.6429 10.7499 9.74747 11.6453 9.74747 12.7499L9.74747 21.2499C9.74747 22.3544 10.6429 23.2499 11.7475 23.2499L20.2475 23.2499C21.352 23.2499 22.2475 22.3544 22.2475 21.2499L22.2475 12.7499C22.2475 11.6453 21.352 10.7499 20.2475 10.7499L18.9975 10.7499"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></path>
                            <path
                              d="M17.9975 12.2499L13.9975 12.2499C13.4452 12.2499 12.9975 11.8022 12.9975 11.2499L12.9975 9.74988C12.9975 9.19759 13.4452 8.74988 13.9975 8.74988L17.9975 8.74988C18.5498 8.74988 18.9975 9.19759 18.9975 9.74988L18.9975 11.2499C18.9975 11.8022 18.5498 12.2499 17.9975 12.2499Z"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></path>
                            <path
                              d="M13.7475 16.2499L18.2475 16.2499"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></path>
                            <path
                              d="M13.7475 19.2499L18.2475 19.2499"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></path>
                            <g className="opacity-0">
                              <path
                                d="M15.9975 5.99988L15.9975 3.99988"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              ></path>
                              <path
                                d="M19.9975 5.99988L20.9975 4.99988"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              ></path>
                              <path
                                d="M11.9975 5.99988L10.9975 4.99988"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              ></path>
                            </g>
                          </svg>
                        </button>
                        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200">
                          <img
                            src="https://tailwindui.com/img/ecommerce-images/home-page-02-product-01.jpg"
                            alt="Black machined steel pen with hexagonal grip and small white logo at top."
                            className="h-full w-full object-cover object-center group-hover:opacity-75"
                          />
                        </div>
                      </div>
                    </li>
                    <li className="relative">
                      <div className="group relative">
                        <button className="group absolute z-10 right-0 bg-gray-200 bg-opacity-80 ml-2 h-7 w-7 items-center justify-center sm:flex">
                          <svg
                            className="h-8 w-8 stroke-slate-400 transition group-hover:stroke-slate-600"
                            fill="none"
                            viewBox="0 0 32 32"
                            xmlns="http://www.w3.org/2000/svg"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path
                              d="M12.9975 10.7499L11.7475 10.7499C10.6429 10.7499 9.74747 11.6453 9.74747 12.7499L9.74747 21.2499C9.74747 22.3544 10.6429 23.2499 11.7475 23.2499L20.2475 23.2499C21.352 23.2499 22.2475 22.3544 22.2475 21.2499L22.2475 12.7499C22.2475 11.6453 21.352 10.7499 20.2475 10.7499L18.9975 10.7499"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></path>
                            <path
                              d="M17.9975 12.2499L13.9975 12.2499C13.4452 12.2499 12.9975 11.8022 12.9975 11.2499L12.9975 9.74988C12.9975 9.19759 13.4452 8.74988 13.9975 8.74988L17.9975 8.74988C18.5498 8.74988 18.9975 9.19759 18.9975 9.74988L18.9975 11.2499C18.9975 11.8022 18.5498 12.2499 17.9975 12.2499Z"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></path>
                            <path
                              d="M13.7475 16.2499L18.2475 16.2499"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></path>
                            <path
                              d="M13.7475 19.2499L18.2475 19.2499"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></path>
                            <g className="opacity-0">
                              <path
                                d="M15.9975 5.99988L15.9975 3.99988"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              ></path>
                              <path
                                d="M19.9975 5.99988L20.9975 4.99988"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              ></path>
                              <path
                                d="M11.9975 5.99988L10.9975 4.99988"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              ></path>
                            </g>
                          </svg>
                        </button>
                        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200">
                          <img
                            src="https://tailwindui.com/img/ecommerce-images/home-page-02-product-01.jpg"
                            alt="Black machined steel pen with hexagonal grip and small white logo at top."
                            className="h-full w-full object-cover object-center group-hover:opacity-75"
                          />
                        </div>
                      </div>
                    </li>
                    <li className="relative">
                      <div className="group relative">
                        <button className="group absolute z-10 right-0 bg-gray-200 bg-opacity-80 ml-2 h-7 w-7 items-center justify-center sm:flex">
                          <svg
                            className="h-8 w-8 stroke-slate-400 transition group-hover:stroke-slate-600"
                            fill="none"
                            viewBox="0 0 32 32"
                            xmlns="http://www.w3.org/2000/svg"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path
                              d="M12.9975 10.7499L11.7475 10.7499C10.6429 10.7499 9.74747 11.6453 9.74747 12.7499L9.74747 21.2499C9.74747 22.3544 10.6429 23.2499 11.7475 23.2499L20.2475 23.2499C21.352 23.2499 22.2475 22.3544 22.2475 21.2499L22.2475 12.7499C22.2475 11.6453 21.352 10.7499 20.2475 10.7499L18.9975 10.7499"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></path>
                            <path
                              d="M17.9975 12.2499L13.9975 12.2499C13.4452 12.2499 12.9975 11.8022 12.9975 11.2499L12.9975 9.74988C12.9975 9.19759 13.4452 8.74988 13.9975 8.74988L17.9975 8.74988C18.5498 8.74988 18.9975 9.19759 18.9975 9.74988L18.9975 11.2499C18.9975 11.8022 18.5498 12.2499 17.9975 12.2499Z"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></path>
                            <path
                              d="M13.7475 16.2499L18.2475 16.2499"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></path>
                            <path
                              d="M13.7475 19.2499L18.2475 19.2499"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></path>
                            <g className="opacity-0">
                              <path
                                d="M15.9975 5.99988L15.9975 3.99988"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              ></path>
                              <path
                                d="M19.9975 5.99988L20.9975 4.99988"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              ></path>
                              <path
                                d="M11.9975 5.99988L10.9975 4.99988"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              ></path>
                            </g>
                          </svg>
                        </button>
                        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200">
                          <img
                            src="https://tailwindui.com/img/ecommerce-images/home-page-02-product-01.jpg"
                            alt="Black machined steel pen with hexagonal grip and small white logo at top."
                            className="h-full w-full object-cover object-center group-hover:opacity-75"
                          />
                        </div>
                      </div>
                    </li>
                    <li className="relative">
                      <div className="group relative">
                        <button className="group absolute z-10 right-0 bg-gray-200 bg-opacity-80 ml-2 h-7 w-7 items-center justify-center sm:flex">
                          <svg
                            className="h-8 w-8 stroke-slate-400 transition group-hover:stroke-slate-600"
                            fill="none"
                            viewBox="0 0 32 32"
                            xmlns="http://www.w3.org/2000/svg"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path
                              d="M12.9975 10.7499L11.7475 10.7499C10.6429 10.7499 9.74747 11.6453 9.74747 12.7499L9.74747 21.2499C9.74747 22.3544 10.6429 23.2499 11.7475 23.2499L20.2475 23.2499C21.352 23.2499 22.2475 22.3544 22.2475 21.2499L22.2475 12.7499C22.2475 11.6453 21.352 10.7499 20.2475 10.7499L18.9975 10.7499"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></path>
                            <path
                              d="M17.9975 12.2499L13.9975 12.2499C13.4452 12.2499 12.9975 11.8022 12.9975 11.2499L12.9975 9.74988C12.9975 9.19759 13.4452 8.74988 13.9975 8.74988L17.9975 8.74988C18.5498 8.74988 18.9975 9.19759 18.9975 9.74988L18.9975 11.2499C18.9975 11.8022 18.5498 12.2499 17.9975 12.2499Z"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></path>
                            <path
                              d="M13.7475 16.2499L18.2475 16.2499"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></path>
                            <path
                              d="M13.7475 19.2499L18.2475 19.2499"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></path>
                            <g className="opacity-0">
                              <path
                                d="M15.9975 5.99988L15.9975 3.99988"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              ></path>
                              <path
                                d="M19.9975 5.99988L20.9975 4.99988"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              ></path>
                              <path
                                d="M11.9975 5.99988L10.9975 4.99988"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              ></path>
                            </g>
                          </svg>
                        </button>
                        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200">
                          <img
                            src="https://tailwindui.com/img/ecommerce-images/home-page-02-product-01.jpg"
                            alt="Black machined steel pen with hexagonal grip and small white logo at top."
                            className="h-full w-full object-cover object-center group-hover:opacity-75"
                          />
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </div>
        {/* END: GALLERY */}

        {/* PRICE */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Precio
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              We'll always let you know about important changes, but you pick
              what else you want to hear about.
            </p>
          </div>

          <form className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <div className="px-4 py-6 sm:p-8">
              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="col-span-full">
                  <label
                    htmlFor="website"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Precio final
                  </label>
                  <div className="mt-2">
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                      <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                        MXN$
                      </span>
                      <input
                        type="text"
                        name="website"
                        id="website"
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-span-full">
                  <Switch.Group
                    as="div"
                    className="flex items-center justify-between"
                  >
                    <span className="flex flex-grow flex-col">
                      <Switch.Label
                        as="span"
                        className="text-sm font-medium leading-6 text-gray-900"
                        passive
                      >
                        Descuentos
                      </Switch.Label>
                      <Switch.Description
                        as="span"
                        className="text-sm text-gray-500"
                      >
                        Habilitar descuentos para este producto.
                      </Switch.Description>
                    </span>
                    <Switch
                      checked={enabled}
                      onChange={setEnabled}
                      className={classNames(
                        enabled ? "bg-indigo-600" : "bg-gray-200",
                        " self-end relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={classNames(
                          enabled ? "translate-x-5" : "translate-x-0",
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                        )}
                      />
                    </Switch>
                  </Switch.Group>

                  {enabled && (
                    <div className="mt-6 space-y-6">
                      <div className="flex items-center gap-x-3">
                        <input
                          id="push-everything"
                          name="push-notifications"
                          type="radio"
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <label
                          htmlFor="push-everything"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          5%
                        </label>
                      </div>
                      <div className="flex items-center gap-x-3">
                        <input
                          id="push-everything"
                          name="push-notifications"
                          type="radio"
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <label
                          htmlFor="push-everything"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          10%
                        </label>
                      </div>
                      <div className="flex items-center gap-x-3">
                        <input
                          id="push-email"
                          name="push-notifications"
                          type="radio"
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <label
                          htmlFor="push-email"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          15%
                        </label>
                      </div>
                      <div className="flex items-center gap-x-3">
                        <input
                          id="push-nothing"
                          name="push-notifications"
                          type="radio"
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <label
                          htmlFor="push-nothing"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          20%
                        </label>
                      </div>
                      <div className="flex items-center gap-x-3">
                        <input
                          id="push-nothing"
                          name="push-notifications"
                          type="radio"
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <label
                          htmlFor="push-nothing"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          25%
                        </label>
                      </div>
                      <div className="flex items-center gap-x-3">
                        <input
                          id="push-nothing"
                          name="push-notifications"
                          type="radio"
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <label
                          htmlFor="push-nothing"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          30%
                        </label>
                      </div>
                      <div className="flex items-center gap-x-3">
                        <input
                          id="push-nothing"
                          name="push-notifications"
                          type="radio"
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <label
                          htmlFor="push-nothing"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          40%
                        </label>
                      </div>
                      <div className="flex items-center gap-x-3">
                        <input
                          id="push-nothing"
                          name="push-notifications"
                          type="radio"
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <label
                          htmlFor="push-nothing"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          50%
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="col-span-full">
                  <div className="sm:col-span-4 mt-4">
                    <div className="flex items-baseline">
                      <label
                        htmlFor="website"
                        className="block w-36 mr-2 mb-4 text-sm font-medium leading-6 text-gray-900"
                      >
                        Precio antes de IVA
                      </label>
                      <div>
                        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                          <input
                            disabled
                            type="text"
                            name="website"
                            id="website"
                            className="block flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                            placeholder="MXN$ 0.00"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-baseline">
                      <label
                        htmlFor="website"
                        className="block w-36 mr-2 mb-4 text-sm font-medium leading-6 text-gray-900"
                      >
                        Comisión
                      </label>
                      <div>
                        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                          <input
                            disabled
                            type="text"
                            name="website"
                            id="website"
                            className="block flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                            placeholder="MXN$ 0.00"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-baseline">
                      <label
                        htmlFor="website"
                        className="block w-36 mr-2 mb-4 text-sm font-medium leading-6 text-gray-900"
                      >
                        Facturación
                      </label>
                      <div>
                        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                          <input
                            disabled
                            type="text"
                            name="website"
                            id="website"
                            className="block flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                            placeholder="MXN$ 0.00"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        {/* END: PRICE */}

        {/* VARIATIONS */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Inventario
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              We'll always let you know about important changes, but you pick
              what else you want to hear about.
            </p>
          </div>

          <form className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <div className="px-4 py-6 sm:p-8">
              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="col-span-full">
                  <label className="text-base font-semibold text-gray-900">
                    Tipo de producto
                  </label>
                  <p className="text-sm text-gray-500">
                    How do you prefer to receive notifications?
                  </p>

                  <fieldset className="mt-4">
                    <legend className="sr-only">Tipo de producto</legend>
                    <div className="space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
                      <div className="flex items-center">
                        <input
                          id="email"
                          name="notification-method"
                          type="radio"
                          checked
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <label
                          for="email"
                          className="ml-3 block text-sm font-medium leading-6 text-gray-900"
                        >
                          Producto único
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="sms"
                          name="notification-method"
                          type="radio"
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <label
                          for="sms"
                          className="ml-3 block text-sm font-medium leading-6 text-gray-900"
                        >
                          Con variaciones (tallas/modelos)
                        </label>
                      </div>
                    </div>
                  </fieldset>
                </div>

                <div className="col-span-full">
                  <div className="sm:col-span-4 mt-4">
                    <div className="flex items-baseline">
                      <label
                        htmlFor="website"
                        className="block w-36 mr-2 mb-4 text-sm font-medium leading-6 text-gray-900"
                      >
                        Inventario
                      </label>
                      <div>
                        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                          <input
                            disabled
                            type="text"
                            name="website"
                            id="website"
                            className="block flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                            placeholder="MXN$ 0.00"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-full">
                  <div className="sm:col-span-4 mt-4">
                    <div className="flex items-baseline">
                      <label
                        htmlFor="website"
                        className="block w-36 mr-2 mb-4 text-sm font-medium leading-6 text-gray-900"
                      >
                        Peso
                      </label>
                      <div>
                        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                          <input
                            disabled
                            type="text"
                            name="website"
                            id="website"
                            className="block flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                            placeholder="1.50kg"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-baseline">
                      <label
                        htmlFor="website"
                        className="block w-36 mr-2 mb-4 text-sm font-medium leading-6 text-gray-900"
                      >
                        Alto
                      </label>
                      <div>
                        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                          <input
                            disabled
                            type="text"
                            name="website"
                            id="website"
                            className="block flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                            placeholder="10.0cm"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-baseline">
                      <label
                        htmlFor="website"
                        className="block w-36 mr-2 mb-4 text-sm font-medium leading-6 text-gray-900"
                      >
                        Largo
                      </label>
                      <div>
                        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                          <input
                            disabled
                            type="text"
                            name="website"
                            id="website"
                            className="block flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                            placeholder="10.0cm"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-baseline">
                      <label
                        htmlFor="website"
                        className="block w-36 mr-2 mb-4 text-sm font-medium leading-6 text-gray-900"
                      >
                        Ancho
                      </label>
                      <div>
                        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                          <input
                            disabled
                            type="text"
                            name="website"
                            id="website"
                            className="block flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                            placeholder="10.0cm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-full">
                  <Listbox value={selected} onChange={setSelected}>
                    {({ open }) => (
                      <>
                        <Listbox.Label
                          htmlFor="about"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          Tiempo de elaboración
                        </Listbox.Label>
                        <div className="relative mt-2">
                          <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                            <span className="block truncate">
                              {selected.name}
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                              <ChevronUpDownIcon
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              />
                            </span>
                          </Listbox.Button>

                          <Transition
                            show={open}
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                              {people.map((person) => (
                                <Listbox.Option
                                  key={person.id}
                                  className={({ active }) =>
                                    classNames(
                                      active
                                        ? "bg-indigo-600 text-white"
                                        : "text-gray-900",
                                      "relative cursor-default select-none py-2 pl-3 pr-9"
                                    )
                                  }
                                  value={person}
                                >
                                  {({ selected, active }) => (
                                    <>
                                      <span
                                        className={classNames(
                                          selected
                                            ? "font-semibold"
                                            : "font-normal",
                                          "block truncate"
                                        )}
                                      >
                                        {person.name}
                                      </span>

                                      {selected ? (
                                        <span
                                          className={classNames(
                                            active
                                              ? "text-white"
                                              : "text-indigo-600",
                                            "absolute inset-y-0 right-0 flex items-center pr-4"
                                          )}
                                        >
                                          <CheckIcon
                                            className="h-5 w-5"
                                            aria-hidden="true"
                                          />
                                        </span>
                                      ) : null}
                                    </>
                                  )}
                                </Listbox.Option>
                              ))}
                            </Listbox.Options>
                          </Transition>
                        </div>
                      </>
                    )}
                  </Listbox>
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    Write a few sentences about your product.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
        {/* END: VARIATIONS */}

        {/* MORE DETAILS */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Especificaciones
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              We'll always let you know about important changes, but you pick
              what else you want to hear about.
            </p>
          </div>

          <form className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <div className="px-4 py-6 sm:p-8">
              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label
                    htmlFor="website"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Youtube
                  </label>
                  <div className="mt-2">
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                      <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                        http://
                      </span>
                      <input
                        type="text"
                        name="website"
                        id="website"
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder="www.youtube.com/my-video"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-span-full">
                  <label
                    htmlFor="cover-photo"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Detalles y especificaciones
                  </label>
                  <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                    <div className="text-center">
                      <PhotoIcon
                        className="mx-auto h-12 w-12 text-gray-300"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-span-full">
                  <label
                    htmlFor="cover-photo"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Instructivo
                  </label>
                  <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                    <div className="text-center">
                      <PhotoIcon
                        className="mx-auto h-12 w-12 text-gray-300"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-span-full">
                  <label
                    htmlFor="cover-photo"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Ficha técnica
                  </label>
                  <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                    <div className="text-center">
                      <PhotoIcon
                        className="mx-auto h-12 w-12 text-gray-300"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        {/* END: MORE DETAILS */}

        {/* DELETE */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Eliminar
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              We'll always let you know about important changes, but you pick
              what else you want to hear about.
            </p>
          </div>

          <form className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <div className="px-4 py-6 sm:p-8">
              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label
                    htmlFor="website"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    ¿Estás seguro de querer eliminar el producto?
                  </label>
                  <div className="mt-2">
                    <button
                      type="submit"
                      className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400"
                    >
                      Eliminar producto
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        {/* END: DELETE */}
      </div>
    </>
  );
}
