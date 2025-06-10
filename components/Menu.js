import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { authSucceeded, logout } from "../reducers/user";
import {
  Home,
  Users,
  BookOpen,
  Database as DatabaseIcon,
  Network,
  KeyRound,
} from "lucide-react";

export default function Menu() {
  const dispatch = useDispatch();
  const router = useRouter();

  // On lit le token, projectIds et username depuis Redux
  const token = useSelector((state) => state.user.token);
  const projectIds = useSelector((state) => state.user.projectIds);
  const loggedUserName = useSelector((state) => state.user.username);
  const isLoggedIn = Boolean(token && projectIds?.length);

  // États locaux pour le formulaire de login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_API_BACKEND;

  // Classe CSS pour les boutons de navigation
  const navButtonClass = (href) => {
    const base =
      "px-3 py-1.5 rounded-md border text-gray-800 hover:bg-gray-100 active:scale-95 transition flex items-center gap-1";
    const active =
      router.pathname === href
        ? "bg-gray-200 border-gray-400"
        : "bg-white border-gray-300";
    return `${base} ${active}`;
  };

  // Soumettre le formulaire de login vers /auth/login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    // Retrieve username and password directly from user input
    const loginUsername = username.trim(); // Remove extra spaces
    const loginPassword = password.trim(); // Remove extra spaces

    // Ensure the username and password are not empty
    if (!loginUsername || !loginPassword) {
      setErrorMsg("Username and password are required.");
      setIsSubmitting(false);
      return; // Prevent form submission if fields are empty
    }

    try {
      const res = await fetch(`${backendUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }), // Pass the correct user input values
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Échec de la connexion");
        setIsSubmitting(false);
        return;
      }

      // data contains { token, id, username, isActive, role, lastLogin, projectIds, createdAt, updatedAt }
      const {
        token: jwtToken,
        username: userName,
        isActive,
        role,
        lastLogin,
        projectIds: ids,
      } = data;

      // On stocke dans Redux exactement ces champs (évite passwordHash)
      dispatch(
        authSucceeded({
          token: jwtToken,
          isActive,
          username: userName,
          role,
          lastLogin,
          projectIds: ids,
        })
      );

      // Réinitialisation des champs du formulaire et stop submitting
      setUsername("");
      setPassword("");
      setIsSubmitting(false);
      // Pas de redirection ici
    } catch (err) {
      setErrorMsg("Problème réseau ou serveur indisponible");
      setIsSubmitting(false);
    }
  };

  // Se déconnecter
  const handleLogout = () => {
    dispatch(logout());
    // Pas de redirection ici
  };

  // Use useEffect to log the Redux state after login
  useEffect(() => {
    if (isLoggedIn) {
      // Log the state after user is logged in and Redux state is updated
      console.log("Logged in! Current Redux State:", {
        token,
        projectIds,
        loggedUserName,
      });
    }
  }, [isLoggedIn, token, projectIds, loggedUserName]); // Run when the user logs in or when the Redux state updates

  return (
    <header className="w-full border-b border-gray-200 px-8 bg-white z-50">
      <div className="w-full px-2 py-1 flex items-center justify-between gap-4">
        {/* 1. Logo + Titre */}
        <div className="flex items-center gap-3">
          <Image
            src="/review_pilot.png"
            alt="ReviewPilot"
            width={60}
            height={60}
            priority
          />
          <span className="text-lg font-bold text-gray-800 whitespace-nowrap">
            ReviewPilot
          </span>
        </div>

        {/* 2. Formulaire de login toujours visible lorsqu’on n’est pas connecté */}
        {!isLoggedIn && (
          <form
            onSubmit={handleLoginSubmit}
            className="flex items-center gap-2"
          >
            <KeyRound size={18} strokeWidth={1.8} className="text-gray-500" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)} // Use the local state
              placeholder="Username"
              className="w-32 text-sm rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={isSubmitting}
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Use the local state
              placeholder="Password"
              className="w-32 text-sm rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={isSubmitting}
              required
              minLength={8}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-3 py-1.5 rounded-md border text-white ${
                isSubmitting
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isSubmitting ? "Connexion…" : "OK"}
            </button>
            {errorMsg && (
              <span className="ml-2 text-sm text-red-600">{errorMsg}</span>
            )}
          </form>
        )}

        {/* 3. Navigation / Bouton Déconnexion et message de bienvenue */}
        <div className="flex items-center gap-4">
          {isLoggedIn && (
            <span className="text-gray-800 font-medium">
              Bonjour {loggedUserName} !
            </span>
          )}

          <nav className="flex items-center gap-2 text-base">
            <Link href="/" legacyBehavior>
              <button className={navButtonClass("/")}>
                <Home size={16} strokeWidth={1.8} />
                Home
              </button>
            </Link>
            <Link href="/Authors" legacyBehavior>
              <button className={navButtonClass("/Authors")}>
                <Users size={16} strokeWidth={1.8} />
                Authors
              </button>
            </Link>
            <Link href="/Article" legacyBehavior>
              <button className={navButtonClass("/Article")}>
                <BookOpen size={16} strokeWidth={1.8} />
                Articles
              </button>
            </Link>
            <Link href="/Database" legacyBehavior>
              <button className={navButtonClass("/Database")}>
                <DatabaseIcon size={16} strokeWidth={1.8} />
                Database
              </button>
            </Link>
            <Link href="/Graph" legacyBehavior>
              <button className={navButtonClass("/Graph")}>
                <Network size={16} strokeWidth={1.8} />
                Graph
              </button>
            </Link>
          </nav>

          {/* Bouton Déconnexion si l’utilisateur est connecté */}
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md transition"
            >
              Déconnexion
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
