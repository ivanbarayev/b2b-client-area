import Layout from "./layout"
import Header from "./header"
import Sidebar from "./sidebar"
import LoginPage from "./login"
import { themeConfig } from "./theme.config"
import type { ERPTheme } from "@/lib/theme-system/types"

const theme: ERPTheme = { Layout, Header, Sidebar, LoginPage, themeConfig }
export default theme
