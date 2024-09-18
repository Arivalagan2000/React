import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { constants } from "../utilities/constants";
import { logOut } from "../utilities/helpers";
import { useState } from "react";
import Cookies from "universal-cookie";
import GetProxy from "../../features/common/GetProxy.js";
const cookies = new Cookies();
const proxy = GetProxy();
const baseQuery = fetchBaseQuery({
  baseUrl: constants.BASE_URL,
  prepareHeaders: (headers) => {
    const apiToken = cookies.get("apitoken");
    const username = cookies.get("username");
    headers.set("DTOP_API_TOKEN", apiToken);
    headers.set("USERNAME", username);
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result?.meta?.response?.status === 403) {
    logOut();
  } 
  else if (result?.meta?.response?.url === `${proxy}/auth`) {
    logOut();
  } else if (result?.meta?.response?.redirected === true) {
    logOut();
  }
  return result;
};

export const api = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Task"],
  reducerPath: "baseApi",
  endpoints: (build) => ({
    login: build.mutation({
      query: (credentials) => ({
        url: `${proxy}/SignIn`,
        method: "POST",
        body: credentials,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
      }),     
    }),
    getTopHeader: build.query({
      query: (credentials) => ({
        url:`${proxy}/getTopHeader`,
        method: "POST",
        body: credentials,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Authorization:  localStorage.getItem('jwttoken'),
          "Refresh-Token": localStorage.getItem('Refersh'),
        },
      }),
    }),
  }),
});