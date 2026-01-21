let response = await fetch("https://nutriplan-api.vercel.app/api/meals/areas", {method: "GET"});
            let data = await response.json();
            console.log(data);