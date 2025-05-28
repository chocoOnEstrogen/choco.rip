#!/bin/bash

PINK='\033[35m'
PURPLE='\033[34m'
BLUE='\033[36m'
YELLOW='\033[33m'
WHITE='\033[97m'
BOLD='\033[1m'
RESET='\033[0m'

motd_messages=(
    "Nyaa~"
    "Onimai is the best anime!"
    "Ara ara~"
    "I wish cottontailva would notice me :c"
)

show_motd() {
    local random_index=$((RANDOM % ${#motd_messages[@]}))
    local message="${motd_messages[$random_index]}"
    local width=50 

    local padding=$(( (width - ${#message}) / 2 ))
    
    printf "%${padding}s${PURPLE}${BOLD}MOTD:${RESET} ${YELLOW}%s${RESET}\n" "" "$message"
    echo -e "${YELLOW}   * * * * * * * * * * * * * * * * * * * * * * * * *   ${RESET}"
}

banner() {
    clear
    echo -e "${BOLD}${PINK}"
    echo    "  ***********************************************  "
    echo    "  *   Welcome to Selina's Cute Terminal!   *  "
    echo    "  ***********************************************  "
    echo -e "${RESET}"
    echo -e "${PINK}-------------------------------------------------------${RESET}"
    echo -e "${PURPLE}   (o^_^o)  Cosplayer, Developer, VTuber Fan!  (o^_^o)${RESET}"
    echo -e "${PINK}-------------------------------------------------------${RESET}"
    echo -e "${YELLOW}   * * * * * * * * * * * * * * * * * * * * * * * * *   ${RESET}"
}

border() {
    echo -e "${PINK}-------------------------------------------------------${RESET}"
}

show_menu() {
    clear
    banner
    show_motd
    border
    echo -e "${BOLD}${PURPLE}1.${RESET} About Me   ${BOLD}${PINK}2.${RESET} Experience   ${BOLD}${YELLOW}3.${RESET} Contact   ${BOLD}${BLUE}4.${RESET} Socials   ${BOLD}${WHITE}5.${RESET} Exit"
    border
    echo -e "${BOLD}${WHITE}Choose an option (1-5):${RESET} "
}

show_about() {
    clear
    banner
    border
    echo -e "${BOLD}${PINK}Hi! I'm Selina!${RESET}"
    echo -e "${PURPLE}Hikikomori | Cosplayer | Developer | VTuber Fan${RESET}"
    echo -e "${PINK}Hobbies:${RESET}"
    echo -e "  ${YELLOW}*${RESET} Playing games  ${YELLOW}*${RESET} Watching anime  ${YELLOW}*${RESET} Reading manga"
    echo -e "  ${YELLOW}*${RESET} Cosplaying     ${YELLOW}*${RESET} Listening to music  ${YELLOW}*${RESET} Coding"
    echo -e "  ${YELLOW}*${RESET} Tinkering with hardware"
    echo -e "${PURPLE}Sometimes just being cute and silly!${RESET} (^_^)/"
    border
    echo -e "${BOLD}${WHITE}Press Enter to return to menu...${RESET}"
    read
}

show_experience() {
    clear
    banner
    border
    echo -e "${BOLD}${PINK}Currently:${RESET}"
    echo -e "  ${YELLOW}*${RESET} Studying software engineering"
    echo -e "  ${YELLOW}*${RESET} Working on ${PURPLE}VTubersTV${RESET} ${PINK}(https://vtubers.tv)${RESET}"
    echo -e "${PURPLE}Dreaming big, coding cute!${RESET} *\(^_^)/ *"
    border
    echo -e "${BOLD}${WHITE}Press Enter to return to menu...${RESET}"
    read
}

show_contact() {
    clear
    banner
    border
    echo -e "${BOLD}${PINK}Discord:${RESET} ${YELLOW}choco.go${RESET} ${PURPLE}(ID: 1248626823638552701)${RESET}"
    echo -e "${BOLD}${PINK}Email:${RESET} ${YELLOW}selinaonestrogen@gmail.com${RESET}"
    echo -e "${PURPLE}Let's be friends!${RESET} (^_^)b"
    border
    echo -e "${BOLD}${WHITE}Press Enter to return to menu...${RESET}"
    read
}

show_social() {
    clear
    banner
    border
    echo -e "${BOLD}${PINK}GitHub:${RESET} ${YELLOW}https://github.com/chocoOnEstrogen${RESET}"
    echo -e "${BOLD}${PINK}Discord:${RESET} ${YELLOW}https://discord.com/users/1248626823638552701${RESET}"
    echo -e "${PURPLE}Follow for more cuteness!${RESET} <3"
    border
    echo -e "${BOLD}${WHITE}Press Enter to return to menu...${RESET}"
    read
}

execute_function() {
    local function_name=$1
    $function_name
}

while true; do
    show_menu
    read -r choice
    case $choice in
        1) show_about ;;
        2) show_experience ;;
        3) show_contact ;;
        4) show_social ;;
        5)
            banner
            echo -e "${BOLD}${PINK}Bye bye~ (^_^)/${RESET}"
            echo -e "${YELLOW}   * * * * * * * * * * * * * * * * * * * * * * * * *   ${RESET}"
            exit 0
            ;;
        *)
            echo -e "${BOLD}${PINK}Nyaa~ That's not a valid option! Try again!${RESET}"
            sleep 1
            ;;
    esac
done
