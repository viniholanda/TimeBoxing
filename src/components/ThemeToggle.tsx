import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl hover:bg-primary/10 transition-colors"
            onClick={toggleTheme}
            title={theme === 'dark' ? "Mudar para tema claro" : "Mudar para tema escuro"}
        >
            {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500 animate-fade-in" />
            ) : (
                <Moon className="w-5 h-5 text-primary animate-fade-in" />
            )}
            <span className="sr-only">Alternar tema</span>
        </Button>
    );
};
