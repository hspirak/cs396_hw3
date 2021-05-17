"use strict";

const resetDB = require("../config/scripts/populateDB")

const Companion = require("./schema/Companion");
const Doctor = require("./schema/Doctor");

const express = require("express");
const router = express.Router();


// completely resets your database.
// really bad idea irl, but useful for testing
router.route("/reset")
    .get((_req, res) => {
        resetDB(() => {
            res.status(200).send({
                message: "Data has been reset."
            });
        });
    });

router.route("/")
    .get((_req, res) => {
        console.log("GET /");
        res.status(200).send({
            data: "App is running."
        });
    });
    
// ---------------------------------------------------
// Edit below this line
// ---------------------------------------------------
router.route("/doctors")
    .get((req, res) => {
        console.log("GET /doctors");

        // already implemented:
        Doctor.find({})
            .sort('ordering')
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log("POST /doctors");
            if (req.body.name && req.body.seasons)
            {
                var newDoc = {
                    "seasons": req.body.seasons, "name": req.body.name
                };
                if(req.body.image_url)
                {
                    newDoc["image_url"] = req.body.image_url;
                }
                if(req.body.ordering)
                {
                    newDoc["ordering"] = req.body.ordering;
                }
                Doctor.create(newDoc).save()
                .then(doc => { res.status(201).send(doc) });
                return;
            }

            res.status(500).send("missing data");
    });

// optional:
router.route("/doctors/favorites")
    .get((req, res) => {
        console.log(`GET /doctors/favorites`);
        res.status(501).send();
    })
    .post((req, res) => {
        console.log(`POST /doctors/favorites`);
        res.status(501).send();
    });
    
router.route("/doctors/:id")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}`);
        Doctor.findById(req.params.id)
        .then(doctor => {
            if(doctor)
            {
                res.status(200).send(doctor);
                return;
            }
        })
        .catch(err => {
            res.status(404).send("no doctor found");
        });
    })
    .patch((req, res) => {
        console.log(`PATCH /doctors/${req.params.id}`);
        var exist = Doctor.findById(req.params.id);
        var dict = {};

            if (exist)
            {
                if(req.body.name)
                {
                    dict["name"] = req.body.name;
                }
                if(req.body.seasons)
                {
                    dict["seasons"] = req.body.seasons;
                }
                if(req.body.spotify_id)
                {
                    dict["doc_id"] = req.body.doc_id;
                }
                if(req.body.ordering)
                {
                    dict["ordering"] = req.body.ordering;
                }
                if(req.body.image_url)
                {
                    dict["image_url"] = req.body.image_url;
                }

                Doctor.findOneAndUpdate(
                { _id: req.params.id }, 
                dict,
                { new: true } // means you want to return the updated artist
            )
            .then(upd => {
                res.status(200).send(upd);
                return;
            })
            return;
        }
            res.status(404).send("no doctor found");
    })
    .delete((req, res) => {
        console.log(`DELETE /doctors/${req.params.id}`);
        const id = req.params.id;
        var del = Doctor.findById(id);
        if(del)
        {
            Doctor.findOneAndDelete({ _id: id })
            .then(dele => {
                res.status(200).send();
                return;
            })
            return;
        }

        res.status(404).send("no doctor found");
    });
    
router.route("/doctors/:id/companions")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}/companions`);
        Doctor.findById(req.params.id)
        .then(doctor => {
            if(doctor)
            {  
                Companion.find({ doctors: { $in: [ `${req.params.id}` ] } })
                .then(companions => {
                    res.status(200).send(companions);
                })
            }
        })
        .catch(err => {
            res.status(404).send("no companions found for this doctor");
        });
    });
    

router.route("/doctors/:id/goodparent")
    .get((req, res) => {
        var size = 0;
        console.log(`GET /doctors/${req.params.id}/goodparent`);
        Doctor.findById(req.params.id)
        .then(doctor => {
            if(doctor)
            {  
                Companion.find({ doctors: { $in: [ `${req.params.id}` ] } })
                .then(companions => {
                    size = companions.length;
                    Companion.find( {$and: [{ alive: { $in: [ "true" ] } }, { doctors: { $in: [ `${req.params.id}` ] } }  ]})
                    .then(fil => {
                        if(fil.length==size)
                        {
                            res.status(200).send(true);
                            return;
                        }
                        res.status(200).send(false);
                    })
                })
            }
        })
        .catch(err => {
            res.status(404).send("no doctor found");
        });
    });

// optional:
router.route("/doctors/favorites/:doctor_id")
    .delete((req, res) => {
        console.log(`DELETE /doctors/favorites/${req.params.doctor_id}`);
        res.status(501).send();
    });

router.route("/companions")
    .get((req, res) => {
        console.log("GET /companions");
        // already implemented:
        Companion.find({})
            .sort('ordering')
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log("POST /companions");
        if (req.body.name && req.body.seasons && req.body.alive && req.body.character && req.body.doctors)
        {
            const comp = {
                "doctors": req.body.doctors, "seasons": req.body.seasons, "alive": req.body.alive, "character": req.body.character, "name": req.body.name
            };
            if(req.body.image_url)
            {
                comp["image_url"] = req.body.image_url;
            }
            if(req.body.ordering)
            {
                comp["ordering"] = req.body.ordering;
            }
            console.log(Companion);
            console.log(comp)
            Companion.create(comp).save()
            .then(newComp => {res.status(201).send(newComp)} );
            return;
        }
        res.status(500).send("missing data");
    
    });

router.route("/companions/crossover")
    .get((req, res) => {
        console.log(`GET /companions/crossover`);
        Companion.find({ 'doctors.1' : {$exists: true} })
        .then(list => {
            if(list)
            {  
                res.status(200).send(list);
            }
        })
        .catch(err => {
            res.status(404).send("no companions found for this doctor");
        });
    });

// optional:
router.route("/companions/favorites")
    .get((req, res) => {
        console.log(`GET /companions/favorites`);
        res.status(501).send();
    })
    .post((req, res) => {
        console.log(`POST /companions/favorites`);
        res.status(501).send();
    })

router.route("/companions/:id")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}`);
        Companion.findById(req.params.id)
        .then(companion => {
            if(companion)
            {
                res.status(200).send(companion);
                return;
            }
        })
        .catch(err => {
            res.status(404).send("no companion found");
        });
    })
    .patch((req, res) => {
        console.log(`PATCH /companions/${req.params.id}`);
        var exist = Companion.findById(req.params.id);
        var dict = {};

            if (exist)
            {
                if(req.body.doctors)
                {
                    dict["doctors"] = req.body.doctors;
                }
                if(req.body.seasons)
                {
                    dict["seasons"] = req.body.seasons;
                }
                if(req.body.alive)
                {
                    dict["alive"] = req.body.alive;
                }
                if(req.body.character)
                {
                    dict["character"] = req.body.character;
                }
                if(req.body.name)
                {
                    dict["name"] = req.body.name;
                }
                if(req.body.ordering)
                {
                    dict["ordering"] = req.body.ordering;
                }
                if(req.body.image_url)
                {
                    dict["image_url"] = req.body.image_url;
                }

                Companion.findOneAndUpdate(
                { _id: req.params.id }, 
                dict,
                { new: true } // means you want to return the updated artist
            )
            .then(upd => {
                res.status(200).send(upd);
                return;
            })
            return;
        }
            res.status(404).send("no doctor found");
    })
    .delete((req, res) => {
        console.log(`DELETE /companions/${req.params.id}`);
        const id = req.params.id;
        var del = Companion.findById(id);
        if(del)
        {
            Companion.findOneAndDelete({ _id: id })
            .then(dele => {
                res.status(200).send();
                return;
            })
            return;
        }

        res.status(404).send("no Companion found");
    });

router.route("/companions/:id/doctors")
    .get((req, res) => {
        var answer=[];
        var test = 0;
        const makeRequest = async (i, companions) => {
            var ret = await Doctor.findById(companions[i]);
            return ret;
          }
        console.log(`GET /companions/${req.params.id}/doctors`);
        Companion.findById(req.params.id)
        .then(companion => {
            if(companion)
            {
                if(companion.doctors)
                {
                    console.log(companion.doctors)
                    if (companion.doctors.length > 1)
                    {
                        for(var i=0; i<companion.doctors.length; i++)
                        {
                            console.log("doctorss")
                            makeRequest(i, companion.doctors)
                            .then(aDoc => {
                                answer.push(aDoc)
                            })
                            // console.log(Doctor.findById(companion.doctors[i])+"HERE")
                            // Doctor.findById(companion.doctors[i])
                            // .then(doc => {
                            //     answer.push(doc);
                            //     console.log("Updated answer" + answer)
                            //     test += 1;

                            // })
                        
                        }
                        console.log(test+ "THIS IS THE TEST")
                        res.status(200).send(answer)
                    }
                    else {
                        Doctor.findById(companion.doctors)
                        .then(doc => {
                            res.status(200).send(doc);
                        return;
                        })
                        console.log("hereee")
                    }
                }
                else{
                    console.log("okay")
                    res.status(404).send("no doctors found for specified doctor");
                }
            }
            else {
                console.log("ok")
                res.status(404).send("no doctors found for specified doctor");
            }
        })
        .catch(err => {
            console.log(err)
            res.status(404).send("no doctors found for specified doctor");
        });
    });

router.route("/companions/:id/friends")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/friends`);
        Companion.findById(req.params.id)
        .then(companion => {
            if(companion)
            {
                var season = companion.seasons;
                if(season)
                {
                    console.log(companion.seasons)
                    Companion.find({$and: [{seasons: {$in: [season]} }, { _id: {$nin: [companion._id]}} ]} )
                    .then(comp => {
                        res.status(200).send(comp);
                        return;
                    })
                    .catch(err => {
                        console.log( Companion.find({$and: [{seasons: {$in: [season]} }, {_id: {$nin: [companion.id]}} ]} ) );
                        res.status(404).send("no friends found");
                        return;
                    });
                  
                }
            }
        })
        .catch(err => {
            res.status(404).send("no friends found");
            return;
        });
    });

// optional:
router.route("/companions/favorites/:companion_id")
    .delete((req, res) => {
        console.log(`DELETE /companions/favorites/${req.params.companion_id}`);
        res.status(501).send();
    });

module.exports = router;