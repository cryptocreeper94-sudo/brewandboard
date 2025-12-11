import { Theme } from "@/contexts/ThemeContext";

const createTeamTheme = (
  id: string,
  name: string,
  category: "nfl" | "mlb" | "nba" | "nhl" | "mls" | "wsl" | "epl" | "laliga" | "bundesliga" | "seriea" | "ligue1" | "college" | "golf",
  logoUrl: string,
  primaryColor: string,
  secondaryColor: string,
  accentColor: string
): Theme => ({
  id,
  name,
  category,
  watermark: logoUrl,
  colors: {
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    background: primaryColor.includes("black") ? "bg-black" : primaryColor.includes("white") || primaryColor.includes("slate-100") ? "bg-slate-50" : "bg-slate-950",
    cardBg: primaryColor.includes("black") ? "bg-zinc-950" : primaryColor.includes("white") ? "bg-white" : "bg-slate-900",
    textPrimary: primaryColor.includes("white") || primaryColor.includes("slate-100") ? "text-slate-900" : "text-white",
    textSecondary: primaryColor.includes("white") || primaryColor.includes("slate-100") ? "text-slate-600" : "text-slate-300"
  }
});

export const allThemes: Theme[] = [
  // COFFEE THEMES (Default for Brew & Board)
  {
    id: "coffee-classic",
    name: "Coffee Classic",
    category: "coffee",
    colors: {
      primary: "from-[#1a0f09] via-[#2d1810] to-[#3d2418]",
      secondary: "from-[#5c4033] to-[#8b6914]",
      accent: "bg-[#5c4033]",
      background: "bg-stone-50",
      cardBg: "bg-white",
      textPrimary: "text-stone-900",
      textSecondary: "text-stone-600"
    }
  },
  {
    id: "coffee-dark-roast",
    name: "Dark Roast",
    category: "coffee",
    colors: {
      primary: "from-[#0d0705] via-[#1a0f09] to-[#2d1810]",
      secondary: "from-[#8b6914] to-[#d4a574]",
      accent: "bg-[#8b6914]",
      background: "bg-[#0d0705]",
      cardBg: "bg-[#1a0f09]",
      textPrimary: "text-amber-50",
      textSecondary: "text-amber-200/70"
    }
  },
  {
    id: "coffee-espresso",
    name: "Espresso",
    category: "coffee",
    colors: {
      primary: "from-black via-[#1a0f09] to-black",
      secondary: "from-[#d4a574] to-[#8b6914]",
      accent: "bg-[#d4a574]",
      background: "bg-black",
      cardBg: "bg-zinc-950",
      textPrimary: "text-white",
      textSecondary: "text-zinc-300"
    }
  },
  {
    id: "coffee-latte",
    name: "Morning Latte",
    category: "coffee",
    colors: {
      primary: "from-amber-100 via-orange-50 to-amber-50",
      secondary: "from-[#5c4033] to-[#3d2418]",
      accent: "bg-[#5c4033]",
      background: "bg-amber-50",
      cardBg: "bg-white",
      textPrimary: "text-stone-900",
      textSecondary: "text-stone-600"
    }
  },
  {
    id: "coffee-mocha",
    name: "Mocha",
    category: "coffee",
    colors: {
      primary: "from-[#3d2418] via-[#5c4033] to-[#3d2418]",
      secondary: "from-pink-400 to-amber-400",
      accent: "bg-pink-600",
      background: "bg-[#2d1810]",
      cardBg: "bg-[#3d2418]",
      textPrimary: "text-amber-50",
      textSecondary: "text-amber-200/70"
    }
  },
  {
    id: "coffee-corporate",
    name: "Corporate Clean",
    category: "coffee",
    colors: {
      primary: "from-slate-800 via-slate-700 to-slate-800",
      secondary: "from-blue-600 to-blue-400",
      accent: "bg-blue-600",
      background: "bg-slate-100",
      cardBg: "bg-white",
      textPrimary: "text-slate-900",
      textSecondary: "text-slate-600"
    }
  },
  // CLASSIC THEMES
  {
    id: "light",
    name: "Light Mode",
    category: "classic",
    colors: {
      primary: "from-slate-100 via-slate-50 to-white",
      secondary: "from-blue-500 to-purple-500",
      accent: "bg-blue-500",
      background: "bg-slate-50",
      cardBg: "bg-white",
      textPrimary: "text-slate-900",
      textSecondary: "text-slate-600"
    }
  },
  {
    id: "pure-black",
    name: "Pure Black",
    category: "classic",
    colors: {
      primary: "from-black via-zinc-950 to-black",
      secondary: "from-blue-600 to-purple-600",
      accent: "bg-blue-600",
      background: "bg-black",
      cardBg: "bg-zinc-950",
      textPrimary: "text-white",
      textSecondary: "text-zinc-300"
    }
  },
  {
    id: "classic-dark",
    name: "Classic Dark",
    category: "classic",
    colors: {
      primary: "from-slate-900 via-slate-800 to-slate-900",
      secondary: "from-blue-600 to-purple-600",
      accent: "bg-blue-600",
      background: "bg-slate-900",
      cardBg: "bg-slate-800",
      textPrimary: "text-white",
      textSecondary: "text-slate-300"
    }
  },
  // NFL TEAMS (ALL 32)
  createTeamTheme("bills", "Buffalo Bills", "nfl", "https://content.sportslogos.net/logos/7/149/full/n0fd1z6xmhigb0eej3323ebwq.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("dolphins", "Miami Dolphins", "nfl", "https://content.sportslogos.net/logos/7/150/full/4105_miami_dolphins-primary-2018.png", "from-teal-900 via-orange-700 to-teal-900", "from-teal-500 to-orange-500", "bg-teal-600"),
  createTeamTheme("patriots", "New England Patriots", "nfl", "https://content.sportslogos.net/logos/7/151/full/y71myf8mlwlk8lbgagh3fd5e0.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("jets", "New York Jets", "nfl", "https://content.sportslogos.net/logos/7/152/full/9116_new_york_jets-primary-2019.png", "from-green-900 via-slate-800 to-green-900", "from-green-600 to-white", "bg-green-700"),
  createTeamTheme("ravens", "Baltimore Ravens", "nfl", "https://content.sportslogos.net/logos/7/153/full/318.png", "from-purple-900 via-black to-purple-900", "from-purple-600 to-black", "bg-purple-700"),
  createTeamTheme("bengals", "Cincinnati Bengals", "nfl", "https://content.sportslogos.net/logos/7/154/full/403.png", "from-orange-900 via-black to-orange-900", "from-orange-600 to-black", "bg-orange-600"),
  createTeamTheme("browns", "Cleveland Browns", "nfl", "https://content.sportslogos.net/logos/7/155/full/2645_cleveland_browns-primary-2015.png", "from-orange-900 via-amber-800 to-orange-900", "from-orange-600 to-amber-600", "bg-orange-700"),
  createTeamTheme("steelers", "Pittsburgh Steelers", "nfl", "https://content.sportslogos.net/logos/7/156/full/970.png", "from-black via-yellow-800 to-black", "from-yellow-500 to-black", "bg-yellow-500"),
  createTeamTheme("texans", "Houston Texans", "nfl", "https://content.sportslogos.net/logos/7/157/full/593.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-700 to-red-600", "bg-blue-800"),
  createTeamTheme("colts", "Indianapolis Colts", "nfl", "https://content.sportslogos.net/logos/7/158/full/593.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),
  createTeamTheme("jaguars", "Jacksonville Jaguars", "nfl", "https://content.sportslogos.net/logos/7/159/full/8856_jacksonville_jaguars-alternate-2013.png", "from-teal-900 via-yellow-700 to-teal-900", "from-teal-600 to-yellow-500", "bg-teal-700"),
  createTeamTheme("titans", "Tennessee Titans", "nfl", "https://content.sportslogos.net/logos/7/160/full/1053.png", "from-blue-900 via-blue-800 to-blue-900", "from-blue-500 to-red-500", "bg-blue-600"),
  createTeamTheme("broncos", "Denver Broncos", "nfl", "https://content.sportslogos.net/logos/7/161/full/9ebzja2zfeigaziee8y605aqp.png", "from-orange-900 via-blue-800 to-orange-900", "from-orange-600 to-blue-600", "bg-orange-600"),
  createTeamTheme("chiefs", "Kansas City Chiefs", "nfl", "https://content.sportslogos.net/logos/7/162/full/857.png", "from-red-900 via-red-800 to-red-900", "from-red-600 to-yellow-500", "bg-red-600"),
  createTeamTheme("raiders", "Las Vegas Raiders", "nfl", "https://content.sportslogos.net/logos/7/163/full/g9mgk6x3ge26t44cccm9oq1vl.png", "from-black via-slate-800 to-black", "from-slate-600 to-black", "bg-slate-700"),
  createTeamTheme("chargers", "Los Angeles Chargers", "nfl", "https://content.sportslogos.net/logos/7/6446/full/1660_los_angeles__chargers-primary-20201.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-600"),
  createTeamTheme("cowboys", "Dallas Cowboys", "nfl", "https://content.sportslogos.net/logos/7/165/full/406.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-slate-600", "bg-blue-600"),
  createTeamTheme("giants", "New York Giants", "nfl", "https://content.sportslogos.net/logos/7/166/full/919.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("eagles", "Philadelphia Eagles", "nfl", "https://content.sportslogos.net/logos/7/167/full/960.png", "from-green-900 via-slate-800 to-green-900", "from-green-600 to-slate-600", "bg-green-700"),
  createTeamTheme("commanders", "Washington Commanders", "nfl", "https://content.sportslogos.net/logos/7/6832/full/washington_commanders_logo_primary_20226702.png", "from-red-900 via-yellow-700 to-red-900", "from-red-700 to-yellow-500", "bg-red-700"),
  createTeamTheme("bears", "Chicago Bears", "nfl", "https://content.sportslogos.net/logos/7/169/full/364.png", "from-blue-900 via-orange-800 to-blue-900", "from-blue-700 to-orange-600", "bg-blue-800"),
  createTeamTheme("lions", "Detroit Lions", "nfl", "https://content.sportslogos.net/logos/7/170/full/cwuyv0w15ruuk34j9qnfuodf9.png", "from-blue-900 via-slate-700 to-blue-900", "from-blue-600 to-slate-500", "bg-blue-700"),
  createTeamTheme("packers", "Green Bay Packers", "nfl", "https://content.sportslogos.net/logos/7/171/full/dcy03myfhffbki5d7il3.png", "from-green-900 via-yellow-800 to-green-900", "from-green-600 to-yellow-500", "bg-green-600"),
  createTeamTheme("vikings", "Minnesota Vikings", "nfl", "https://content.sportslogos.net/logos/7/172/full/2704_minnesota_vikings-primary-2013.png", "from-purple-900 via-yellow-700 to-purple-900", "from-purple-600 to-yellow-500", "bg-purple-700"),
  createTeamTheme("falcons", "Atlanta Falcons", "nfl", "https://content.sportslogos.net/logos/7/173/full/299.png", "from-red-900 via-black to-red-900", "from-red-600 to-black", "bg-red-700"),
  createTeamTheme("panthers", "Carolina Panthers", "nfl", "https://content.sportslogos.net/logos/7/174/full/f1wggq2k8ql88fe33jzhw641u.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-slate-600", "bg-blue-700"),
  createTeamTheme("saints", "New Orleans Saints", "nfl", "https://content.sportslogos.net/logos/7/175/full/907.png", "from-black via-yellow-700 to-black", "from-yellow-500 to-black", "bg-yellow-600"),
  createTeamTheme("buccaneers", "Tampa Bay Buccaneers", "nfl", "https://content.sportslogos.net/logos/7/176/full/tampa_bay_buccaneers_logo_primary_20207125.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-slate-600", "bg-red-700"),
  createTeamTheme("cardinals", "Arizona Cardinals", "nfl", "https://content.sportslogos.net/logos/7/177/full/kwth8f1cfa2sch5xhjjfaof90.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-white", "bg-red-700"),
  createTeamTheme("rams", "Los Angeles Rams", "nfl", "https://content.sportslogos.net/logos/7/5941/full/8334_los_angeles_rams-primary-20201.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-700"),
  createTeamTheme("49ers", "San Francisco 49ers", "nfl", "https://content.sportslogos.net/logos/7/179/full/9455_san_francisco_49ers-primary-2009.png", "from-red-900 via-yellow-800 to-red-900", "from-red-600 to-yellow-500", "bg-red-600"),
  createTeamTheme("seahawks", "Seattle Seahawks", "nfl", "https://content.sportslogos.net/logos/7/180/full/pfiobtreaq7j0pzvadktsc6jv.png", "from-blue-900 via-green-800 to-blue-900", "from-blue-600 to-green-600", "bg-blue-600"),
  // MLB TEAMS (ALL 30)
  createTeamTheme("orioles", "Baltimore Orioles", "mlb", "https://content.sportslogos.net/logos/53/52/full/orioles_cap_2019_full.png", "from-orange-900 via-black to-orange-900", "from-orange-600 to-black", "bg-orange-600"),
  createTeamTheme("redsox", "Boston Red Sox", "mlb", "https://content.sportslogos.net/logos/53/53/full/c0whx9c2cyjay4c3acgv7cikt.png", "from-red-900 via-blue-800 to-red-900", "from-red-600 to-blue-600", "bg-red-700"),
  createTeamTheme("yankees", "New York Yankees", "mlb", "https://content.sportslogos.net/logos/53/68/full/1256.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-slate-600", "bg-blue-800"),
  createTeamTheme("rays", "Tampa Bay Rays", "mlb", "https://content.sportslogos.net/logos/53/2535/full/2706_tampa_bay_rays-primary-2019.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-700"),
  createTeamTheme("bluejays", "Toronto Blue Jays", "mlb", "https://content.sportslogos.net/logos/53/78/full/1702_toronto_blue_jays-primary-2020.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("whitesox", "Chicago White Sox", "mlb", "https://content.sportslogos.net/logos/53/55/full/382.png", "from-black via-slate-800 to-black", "from-slate-600 to-black", "bg-slate-800"),
  createTeamTheme("guardians", "Cleveland Guardians", "mlb", "https://content.sportslogos.net/logos/53/57/full/3251_cleveland_guardians-primary-2022.png", "from-red-900 via-blue-800 to-red-900", "from-red-600 to-blue-600", "bg-red-700"),
  createTeamTheme("tigers", "Detroit Tigers", "mlb", "https://content.sportslogos.net/logos/53/59/full/5765_detroit_tigers-primary-2016.png", "from-blue-900 via-orange-700 to-blue-900", "from-blue-700 to-orange-600", "bg-blue-800"),
  createTeamTheme("royals", "Kansas City Royals", "mlb", "https://content.sportslogos.net/logos/53/62/full/1105.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),
  createTeamTheme("twins", "Minnesota Twins", "mlb", "https://content.sportslogos.net/logos/53/65/full/5765_minnesota_twins-primary-2023.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("astros", "Houston Astros", "mlb", "https://content.sportslogos.net/logos/53/4929/full/ffnz3wdbpzkpfb4fznk5ln0fu.png", "from-orange-900 via-blue-800 to-orange-900", "from-orange-600 to-blue-600", "bg-orange-600"),
  createTeamTheme("angels", "Los Angeles Angels", "mlb", "https://content.sportslogos.net/logos/53/6521/full/3785_los_angeles_angels-primary-2016.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-slate-600", "bg-red-700"),
  createTeamTheme("athletics", "Oakland Athletics", "mlb", "https://content.sportslogos.net/logos/53/69/full/1075.png", "from-green-900 via-yellow-700 to-green-900", "from-green-600 to-yellow-500", "bg-green-700"),
  createTeamTheme("mariners", "Seattle Mariners", "mlb", "https://content.sportslogos.net/logos/53/75/full/2455_seattle_mariners-primary-2022.png", "from-blue-900 via-teal-800 to-blue-900", "from-blue-600 to-teal-500", "bg-blue-800"),
  createTeamTheme("rangers", "Texas Rangers", "mlb", "https://content.sportslogos.net/logos/53/77/full/9584_texas_rangers-primary-2020.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("braves", "Atlanta Braves", "mlb", "https://content.sportslogos.net/logos/54/51/full/6xyh4ufs6wzwtr4lh7rb81mi8.png", "from-red-900 via-blue-800 to-red-900", "from-red-600 to-blue-600", "bg-red-700"),
  createTeamTheme("marlins", "Miami Marlins", "mlb", "https://content.sportslogos.net/logos/54/3637/full/8566_miami_marlins-primary-2019.png", "from-blue-900 via-red-700 to-blue-900", "from-blue-600 to-red-500", "bg-blue-700"),
  createTeamTheme("mets", "New York Mets", "mlb", "https://content.sportslogos.net/logos/54/67/full/m01gfgeorgvbfw15fy04alujm.png", "from-blue-900 via-orange-700 to-blue-900", "from-blue-600 to-orange-500", "bg-blue-700"),
  createTeamTheme("phillies", "Philadelphia Phillies", "mlb", "https://content.sportslogos.net/logos/54/70/full/5765_philadelphia_phillies-primary-2019.png", "from-red-900 via-blue-800 to-red-900", "from-red-600 to-blue-600", "bg-red-700"),
  createTeamTheme("nationals", "Washington Nationals", "mlb", "https://content.sportslogos.net/logos/54/578/full/rcehf4ozugo71dit8m3h.png", "from-red-900 via-blue-800 to-red-900", "from-red-600 to-blue-600", "bg-red-700"),
  createTeamTheme("cubs", "Chicago Cubs", "mlb", "https://content.sportslogos.net/logos/54/54/full/c1l1h78e43949ggnb7n5xq7l6.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("reds", "Cincinnati Reds", "mlb", "https://content.sportslogos.net/logos/54/56/full/1809_cincinnati_reds-primary-2013.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-white", "bg-red-700"),
  createTeamTheme("brewers", "Milwaukee Brewers", "mlb", "https://content.sportslogos.net/logos/54/64/full/8333_milwaukee_brewers-primary-2020.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-800"),
  createTeamTheme("pirates", "Pittsburgh Pirates", "mlb", "https://content.sportslogos.net/logos/54/71/full/1250.png", "from-black via-yellow-700 to-black", "from-yellow-500 to-black", "bg-yellow-600"),
  createTeamTheme("cardinals-mlb", "St. Louis Cardinals", "mlb", "https://content.sportslogos.net/logos/54/72/full/3zhma0aeq17tktge1huh.png", "from-red-900 via-blue-800 to-red-900", "from-red-600 to-blue-600", "bg-red-700"),
  createTeamTheme("diamondbacks", "Arizona Diamondbacks", "mlb", "https://content.sportslogos.net/logos/54/50/full/arizona_diamondbacks_logo_primary_20239847.png", "from-red-900 via-teal-800 to-red-900", "from-red-600 to-teal-500", "bg-red-700"),
  createTeamTheme("rockies", "Colorado Rockies", "mlb", "https://content.sportslogos.net/logos/54/58/full/5765_colorado_rockies-primary-2017.png", "from-purple-900 via-slate-800 to-purple-900", "from-purple-600 to-black", "bg-purple-800"),
  createTeamTheme("dodgers", "Los Angeles Dodgers", "mlb", "https://content.sportslogos.net/logos/54/63/full/oioet9dkhgerb14tojkl.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),
  createTeamTheme("padres", "San Diego Padres", "mlb", "https://content.sportslogos.net/logos/54/73/full/san_diego_padres_logo_primary_20207829.png", "from-amber-900 via-slate-800 to-amber-900", "from-amber-600 to-slate-600", "bg-amber-700"),
  createTeamTheme("giants-mlb", "San Francisco Giants", "mlb", "https://content.sportslogos.net/logos/54/74/full/cpqj6up5bvgpoedg5fwsk0hvo.png", "from-orange-900 via-black to-orange-900", "from-orange-600 to-black", "bg-orange-600"),
  // NBA TEAMS (ALL 30)
  createTeamTheme("celtics", "Boston Celtics", "nba", "https://content.sportslogos.net/logos/6/213/full/slhg02hbef3j1ov4lsnwyol5o.png", "from-green-900 via-slate-800 to-green-900", "from-green-600 to-white", "bg-green-700"),
  createTeamTheme("nets", "Brooklyn Nets", "nba", "https://content.sportslogos.net/logos/6/3786/full/brooklyn_nets_logo_primary_20135763.png", "from-black via-slate-800 to-black", "from-slate-600 to-white", "bg-slate-800"),
  createTeamTheme("knicks", "New York Knicks", "nba", "https://content.sportslogos.net/logos/6/216/full/2nn48xofg0hms8k326cqdmuis.png", "from-blue-900 via-orange-700 to-blue-900", "from-blue-600 to-orange-500", "bg-blue-700"),
  createTeamTheme("76ers", "Philadelphia 76ers", "nba", "https://content.sportslogos.net/logos/6/218/full/7034_philadelphia_76ers-primary-2016.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("raptors", "Toronto Raptors", "nba", "https://content.sportslogos.net/logos/6/227/full/8756_toronto_raptors-primary-2021.png", "from-red-900 via-black to-red-900", "from-red-600 to-black", "bg-red-700"),
  createTeamTheme("bulls", "Chicago Bulls", "nba", "https://content.sportslogos.net/logos/6/221/full/hj3gmh82w9hffmeh3fjm5h874.png", "from-red-900 via-black to-red-900", "from-red-600 to-black", "bg-red-700"),
  createTeamTheme("cavaliers", "Cleveland Cavaliers", "nba", "https://content.sportslogos.net/logos/6/222/full/cleveland_cavaliers_logo_primary_2023_sportslogosnet-3339.png", "from-red-900 via-blue-800 to-red-900", "from-red-700 to-yellow-500", "bg-red-800"),
  createTeamTheme("pistons", "Detroit Pistons", "nba", "https://content.sportslogos.net/logos/6/223/full/detroit_pistons_logo_primary_2018_sportslogosnet-5765.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("pacers", "Indiana Pacers", "nba", "https://content.sportslogos.net/logos/6/224/full/4812_indiana_pacers-primary-2018.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-700"),
  createTeamTheme("bucks", "Milwaukee Bucks", "nba", "https://content.sportslogos.net/logos/6/225/full/7463_milwaukee_bucks-primary-2016.png", "from-green-900 via-slate-800 to-green-900", "from-green-600 to-slate-600", "bg-green-700"),
  createTeamTheme("hawks", "Atlanta Hawks", "nba", "https://content.sportslogos.net/logos/6/220/full/8190_atlanta_hawks-primary-2021.png", "from-red-900 via-yellow-700 to-red-900", "from-red-600 to-yellow-500", "bg-red-700"),
  createTeamTheme("hornets", "Charlotte Hornets", "nba", "https://content.sportslogos.net/logos/6/5120/full/1926_charlotte__hornets_-primary-2015.png", "from-teal-900 via-purple-800 to-teal-900", "from-teal-500 to-purple-500", "bg-teal-700"),
  createTeamTheme("heat", "Miami Heat", "nba", "https://content.sportslogos.net/logos/6/214/full/burm5gh2wvjti3xhei5h16k8e.png", "from-red-900 via-black to-red-900", "from-red-600 to-yellow-500", "bg-red-600"),
  createTeamTheme("magic", "Orlando Magic", "nba", "https://content.sportslogos.net/logos/6/217/full/orlando_magic_logo_primary_20117178.png", "from-blue-900 via-black to-blue-900", "from-blue-600 to-black", "bg-blue-700"),
  createTeamTheme("wizards", "Washington Wizards", "nba", "https://content.sportslogos.net/logos/6/219/full/5765_washington_wizards-primary-2015.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("nuggets", "Denver Nuggets", "nba", "https://content.sportslogos.net/logos/6/229/full/8926_denver_nuggets-primary-2019.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-700"),
  createTeamTheme("timberwolves", "Minnesota Timberwolves", "nba", "https://content.sportslogos.net/logos/6/232/full/minnesota_timberwolves_logo_primary_20189413.png", "from-blue-900 via-green-800 to-blue-900", "from-blue-600 to-green-500", "bg-blue-800"),
  createTeamTheme("thunder", "Oklahoma City Thunder", "nba", "https://content.sportslogos.net/logos/6/2687/full/khmovcnezy06c3nm05ccn0oj2.png", "from-blue-900 via-orange-700 to-blue-900", "from-blue-600 to-orange-500", "bg-blue-700"),
  createTeamTheme("blazers", "Portland Trail Blazers", "nba", "https://content.sportslogos.net/logos/6/239/full/9725_portland_trail_blazers-primary-2018.png", "from-red-900 via-black to-red-900", "from-red-600 to-black", "bg-red-700"),
  createTeamTheme("jazz", "Utah Jazz", "nba", "https://content.sportslogos.net/logos/6/234/full/utah_jazz_logo_primary_20238259.png", "from-yellow-900 via-blue-800 to-yellow-900", "from-yellow-600 to-blue-600", "bg-yellow-700"),
  createTeamTheme("warriors", "Golden State Warriors", "nba", "https://content.sportslogos.net/logos/6/235/full/qhhir6fj8zp30f33s7sfz4822.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-600"),
  createTeamTheme("clippers", "Los Angeles Clippers", "nba", "https://content.sportslogos.net/logos/6/236/full/los_angeles_clippers_logo_primary_20245765.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("lakers", "Los Angeles Lakers", "nba", "https://content.sportslogos.net/logos/6/237/full/uig7aiht8jnpl1szbi57zzlsh.png", "from-purple-900 via-yellow-700 to-purple-900", "from-purple-600 to-yellow-500", "bg-purple-600"),
  createTeamTheme("suns", "Phoenix Suns", "nba", "https://content.sportslogos.net/logos/6/238/full/phoenix_suns_logo_primary_20143696.png", "from-purple-900 via-orange-700 to-purple-900", "from-purple-600 to-orange-500", "bg-purple-700"),
  createTeamTheme("kings", "Sacramento Kings", "nba", "https://content.sportslogos.net/logos/6/240/full/4043_sacramento_kings-primary-2017.png", "from-purple-900 via-slate-800 to-purple-900", "from-purple-600 to-slate-600", "bg-purple-700"),
  createTeamTheme("mavericks", "Dallas Mavericks", "nba", "https://content.sportslogos.net/logos/6/228/full/3463_dallas_mavericks-primary-2018.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-slate-600", "bg-blue-700"),
  createTeamTheme("rockets", "Houston Rockets", "nba", "https://content.sportslogos.net/logos/6/230/full/6830_houston_rockets-primary-2020.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-slate-600", "bg-red-700"),
  createTeamTheme("grizzlies", "Memphis Grizzlies", "nba", "https://content.sportslogos.net/logos/6/231/full/4373_memphis_grizzlies-primary-2019.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-800"),
  createTeamTheme("pelicans", "New Orleans Pelicans", "nba", "https://content.sportslogos.net/logos/6/4962/full/2681_new_orleans_pelicans-primary-2014.png", "from-blue-900 via-red-700 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("spurs", "San Antonio Spurs", "nba", "https://content.sportslogos.net/logos/6/233/full/2547_san_antonio_spurs-primary-2018.png", "from-slate-900 via-black to-slate-900", "from-slate-600 to-black", "bg-slate-800"),
  // NHL TEAMS (SELECTION)
  createTeamTheme("bruins", "Boston Bruins", "nhl", "https://content.sportslogos.net/logos/1/3/full/venf9fmhgnsawnxxvehf.png", "from-black via-yellow-700 to-black", "from-yellow-500 to-black", "bg-yellow-600"),
  createTeamTheme("sabres", "Buffalo Sabres", "nhl", "https://content.sportslogos.net/logos/1/4/full/4622_buffalo_sabres-primary-2021.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-700"),
  createTeamTheme("redwings", "Detroit Red Wings", "nhl", "https://content.sportslogos.net/logos/1/11/full/yo3wysbjtagzmwj37tb11u0fh.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-white", "bg-red-700"),
  createTeamTheme("blackhawks", "Chicago Blackhawks", "nhl", "https://content.sportslogos.net/logos/1/7/full/56.png", "from-red-900 via-black to-red-900", "from-red-600 to-black", "bg-red-700"),
  createTeamTheme("predators", "Nashville Predators", "nhl", "https://content.sportslogos.net/logos/1/17/full/lvqqxeeblvuplezo8slu.png", "from-yellow-900 via-blue-800 to-yellow-900", "from-yellow-500 to-blue-600", "bg-yellow-600"),
  createTeamTheme("penguins", "Pittsburgh Penguins", "nhl", "https://content.sportslogos.net/logos/1/24/full/3671_pittsburgh_penguins-primary-2017.png", "from-black via-yellow-700 to-black", "from-yellow-500 to-black", "bg-yellow-600"),
  createTeamTheme("avalanche", "Colorado Avalanche", "nhl", "https://content.sportslogos.net/logos/1/8/full/64.png", "from-red-900 via-blue-800 to-red-900", "from-red-600 to-blue-600", "bg-red-700"),
  createTeamTheme("stars", "Dallas Stars", "nhl", "https://content.sportslogos.net/logos/1/10/full/dallas_stars_logo_primary_20222423.png", "from-green-900 via-slate-800 to-green-900", "from-green-600 to-white", "bg-green-700"),
];

export const themeCategories = [
  { id: "coffee", name: "Coffee Themes", icon: "☕" },
  { id: "classic", name: "Classic", icon: "🎨" },
  { id: "nfl", name: "NFL Teams", icon: "🏈" },
  { id: "mlb", name: "MLB Teams", icon: "⚾" },
  { id: "nba", name: "NBA Teams", icon: "🏀" },
  { id: "nhl", name: "NHL Teams", icon: "🏒" },
];
