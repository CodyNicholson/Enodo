﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;
using Capstone_Project.Dtos;
using Capstone_Project.Models;

namespace Capstone_Project
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Domain to Dto
            Mapper.CreateMap<ApplicationUser, UserDto>();
            Mapper.CreateMap<UserDto, ApplicationUser>();

            Mapper.CreateMap<Survey, SurveyDto>();
            Mapper.CreateMap<SurveyDto, Survey>();

            Mapper.CreateMap<SurveyResults, SurveyResultsDto>();
            Mapper.CreateMap<SurveyResultsDto, SurveyResults>();

            // Dto to Domain
            Mapper.CreateMap<UserDto, ApplicationUser>().ForMember(c => c.Id, opt => opt.Ignore());
            Mapper.CreateMap<SurveyDto, Survey>().ForMember(c => c.Id, opt => opt.Ignore());
            Mapper.CreateMap<SurveyResultsDto, SurveyResults>().ForMember(c => c.Id, opt => opt.Ignore());
        }
    }
}